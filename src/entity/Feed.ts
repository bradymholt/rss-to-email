import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Relation, OneToMany } from "typeorm";
import { FeedItems } from "./FeedItems.js";

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

  @OneToMany(() => FeedItems, (item) => item.feed)
  items: Promise<Relation<FeedItems[]>>;
}
