import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from redis.asyncio import Redis

from app.database import get_db
from app.redis import get_redis
from app.models.user import User
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/todos", tags=["Todos"])

def get_cache_key(user_id: int) -> str:
    return f"todos:user:{user_id}"

@router.get("", response_model=List[TodoResponse])
async def read_todos(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    cache_key = get_cache_key(current_user.id)
    cached_data = await redis.get(cache_key)

    if cached_data:
        return json.loads(cached_data)

    result = await db.execute(select(Todo).where(Todo.owner_id == current_user.id).order_by(Todo.id.desc()))
    todos = result.scalars().all()

    todo_list = [TodoResponse.model_validate(t).model_dump() for t in todos]
    await redis.setex(cache_key, 300, json.dumps(todo_list))  # Cache for 5 minutes

    return todo_list

@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_in: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    todo = Todo(**todo_in.model_dump(), owner_id=current_user.id)
    db.add(todo)
    await db.commit()
    await db.refresh(todo)

    await redis.delete(get_cache_key(current_user.id))
    return todo

@router.patch("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_in: TodoUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    result = await db.execute(select(Todo).where(Todo.id == todo_id, Todo.owner_id == current_user.id))
    todo = result.scalars().first()

    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    update_data = todo_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)

    await db.commit()
    await db.refresh(todo)

    await redis.delete(get_cache_key(current_user.id))
    return todo

@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    result = await db.execute(select(Todo).where(Todo.id == todo_id, Todo.owner_id == current_user.id))
    todo = result.scalars().first()

    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    await db.delete(todo)
    await db.commit()

    await redis.delete(get_cache_key(current_user.id))
