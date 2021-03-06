"""empty message

Revision ID: 9600c83bb5a7
Revises: 72ee1e865a65
Create Date: 2017-03-11 06:03:05.383824

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9600c83bb5a7'
down_revision = '72ee1e865a65'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.String(length=64), nullable=False),
    sa.Column('first_name', sa.String(length=64), nullable=True),
    sa.Column('last_name', sa.String(length=64), nullable=True),
    sa.Column('photo', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('activities',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('page_name', sa.String(length=64), nullable=True),
    sa.Column('filename', sa.String(length=64), nullable=True),
    sa.Column('created_at', sa.Float(), nullable=True),
    sa.Column('size', sa.Integer(), nullable=True),
    sa.Column('user_id', sa.String(length=64), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('pages',
    sa.Column('id', sa.String(length=64), nullable=False),
    sa.Column('name', sa.String(length=64), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('category', sa.String(length=64), nullable=True),
    sa.Column('photo', sa.Text(), nullable=True),
    sa.Column('user_id', sa.String(length=64), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('pages')
    op.drop_table('activities')
    op.drop_table('users')
    # ### end Alembic commands ###
