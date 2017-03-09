"""empty message

Revision ID: bcfcc5b35c6e
Revises: 5e6fed4a7791
Create Date: 2017-03-09 23:10:53.541810

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bcfcc5b35c6e'
down_revision = '5e6fed4a7791'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('activities',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('page_name', sa.String(length=64), nullable=True),
    sa.Column('filename', sa.String(length=64), nullable=True),
    sa.Column('created_at', sa.Float(), nullable=True),
    sa.Column('size', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('activities')
    # ### end Alembic commands ###
