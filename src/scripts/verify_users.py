"""
CLI tool to mark users as email-verified without sending emails.

This is useful for testing flows when you don't have a valid mailbox
to receive verification links.

Features:
- Verify a single user by `--email` or all unverified users with `--all`.
- Optional `--set-active` to activate accounts (`is_active = True`).
- `--dry-run` to preview changes without committing.

Additionally, you can override the database connection string via
`--dsn postgresql://user:pass@host:port/dbname` when running locally.

The script uses the project's configured database connection
(`POSTGRES_CONNECTION_STRING` via `src.config.settings`).
"""

import argparse

from sqlalchemy.orm import Session

from src.config.database import SessionLocal
from src.models.models import User


def _apply_verification(user: User, set_active: bool) -> bool:
    """Apply verification flags to a single user.

    Returns True if any change was made, False otherwise.
    """
    changed = False

    # Mark email as verified
    if not user.email_verified:
        user.email_verified = True
        changed = True

    # Optionally mark as active to allow login
    if set_active and not user.is_active:
        user.is_active = True
        changed = True

    # Clear verification token and expiry to reflect verified state
    # (These fields are not needed once the email is verified)
    user.verification_token = None
    user.verification_token_expiry = None

    return changed


def verify_by_email(db: Session, email: str, set_active: bool, dry_run: bool) -> tuple[int, str]:
    """Verify a specific user by email.

    Returns a tuple (updated_count, message).
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return 0, f"Usuário não encontrado para o email: {email}"

    changed = _apply_verification(user, set_active)
    if not changed:
        # Nothing changed, user likely already verified/active
        return 0, f"Nenhuma alteração necessária para: {email} (já verificado/ativo)"

    if dry_run:
        # Do not commit changes
        return 1, f"Dry-run: 1 usuário seria atualizado ({email})."

    db.commit()
    return (
        1,
        f"Usuário atualizado: {email} (email_verified=True{', is_active=True' if set_active else ''}).",
    )


def verify_all_unverified(db: Session, set_active: bool, dry_run: bool) -> tuple[int, str]:
    """Verify all users that are currently unverified.

    Returns a tuple (updated_count, message).
    """
    users = db.query(User).filter(User.email_verified == False).all()  # noqa: E712
    if not users:
        return 0, "Nenhum usuário não verificado encontrado."

    updated = 0
    for user in users:
        # Apply verification for each user
        if _apply_verification(user, set_active):
            updated += 1

    if dry_run:
        return updated, f"Dry-run: {updated} usuário(s) seriam atualizados."

    db.commit()
    return (
        updated,
        f"{updated} usuário(s) atualizado(s) (email_verified=True{', is_active=True' if set_active else ''}).",
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Verificar usuários sem envio de e-mail",
    )

    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument(
        "--email",
        type=str,
        help="Email de um usuário específico a verificar",
    )
    target.add_argument(
        "--all",
        action="store_true",
        help="Verificar todos os usuários não verificados",
    )

    parser.add_argument(
        "--set-active",
        action="store_true",
        help="Também ativar a conta (is_active=True)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Exibir o que seria alterado sem gravar",
    )

    parser.add_argument(
        "--dsn",
        type=str,
        help="DSN do banco para sobrescrever a conexão (ex.: postgresql://postgres:root@localhost:5433/evo_ai)",
    )

    args = parser.parse_args()

    # Open a database session only when we need it
    if args.dsn:
        # Allow overriding the connection string locally without changing .env
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker

        engine = create_engine(args.dsn)
        SessionLocalOverride = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        with SessionLocalOverride() as db:
            if args.email:
                updated, message = verify_by_email(db, args.email, args.set_active, args.dry_run)
            else:
                updated, message = verify_all_unverified(db, args.set_active, args.dry_run)
    else:
        with SessionLocal() as db:
            if args.email:
                updated, message = verify_by_email(db, args.email, args.set_active, args.dry_run)
            else:
                updated, message = verify_all_unverified(db, args.set_active, args.dry_run)

    # Print a concise result in Portuguese to match user expectations
    print(message)


if __name__ == "__main__":
    main()
