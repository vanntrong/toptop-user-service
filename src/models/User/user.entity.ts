import * as bcrypt from 'bcryptjs';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ fulltext: true })
  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  locate: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: string;

  @Column({})
  password: string;

  @Index({ unique: true, fulltext: true })
  @Column({
    unique: true,
    nullable: true,
  })
  username: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    nullable: true,
  })
  bio: string;

  @Column({
    default: false,
    name: 'is_verified',
  })
  isVerified: boolean;

  @Column({
    default: false,
    name: 'is_deleted',
    select: false,
  })
  isDeleted: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date;

  @BeforeInsert()
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 10);
  }
}
