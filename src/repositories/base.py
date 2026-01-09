"""
Base repository with generic CRUD operations.
"""

from typing import Generic, TypeVar, Type, Optional, List, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Repository base com operações CRUD genéricas"""

    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get(self, id: Any) -> Optional[T]:
        """
        Busca registro por ID.

        Args:
            id: ID do registro

        Returns:
            Registro encontrado ou None
        """
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """
        Lista todos os registros com paginação.

        Args:
            skip: Número de registros para pular
            limit: Número máximo de registros

        Returns:
            Lista de registros
        """
        return self.db.query(self.model).offset(skip).limit(limit).all()

    def create(self, obj: T) -> T:
        """
        Cria novo registro.

        Args:
            obj: Objeto a ser criado

        Returns:
            Objeto criado com ID
        """
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: T) -> T:
        """
        Atualiza registro existente.

        Args:
            obj: Objeto a ser atualizado

        Returns:
            Objeto atualizado
        """
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, id: Any) -> bool:
        """
        Deleta registro por ID.

        Args:
            id: ID do registro

        Returns:
            True se deletado, False se não encontrado
        """
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
            return True
        return False

    def count(self) -> int:
        """
        Conta total de registros.

        Returns:
            Número total de registros
        """
        return self.db.query(self.model).count()

    def exists(self, id: Any) -> bool:
        """
        Verifica se registro existe.

        Args:
            id: ID do registro

        Returns:
            True se existe, False caso contrário
        """
        return self.db.query(self.model).filter(self.model.id == id).first() is not None
