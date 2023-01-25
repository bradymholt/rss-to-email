import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Relation, ManyToOne } from "typeorm";
import { Feed } from "./Feed.js";

@Entity()
export class UserFeedItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Feed, (feed) => feed.items)
  feed: Relation<Feed>;

  @Column()
  linkUrl: string;

  @Column()
  delivered: boolean;
}
