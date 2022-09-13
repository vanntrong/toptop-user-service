import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class UserFollow {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  followedId: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;
}
