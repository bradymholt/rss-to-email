import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Relation, OneToMany } from "typeorm";
import { FeedItem } from "./FeedItem.js";

@Entity({name: "feeds"})
export class Feed extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  createdAtEpoch: number;

  @OneToMany(() => FeedItem, (item) => item.feed)
  items: Promise<Relation<FeedItem[]>>;
}
