import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Relation, ManyToOne } from "typeorm";
import { Feed } from "./Feed.js";

@Entity({name: "feed_items"})
export class FeedItem extends BaseEntity { 
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Feed, (feed) => feed.items)
  feed: Relation<Feed>;

  @Column()
  guid: string;

  @Column()
  emailSentAtEpoch: number;
}
