import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Relation, OneToMany } from "typeorm";
import { UserFeedItem } from "./UserFeedItems.js";

@Entity()
export class Feed extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;    

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  createdAtEpoch: number;

  @OneToMany(() => UserFeedItem, (item) => item.feed)
  items: Relation<UserFeedItem[]>;
}
