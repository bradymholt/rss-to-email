import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, Relation, OneToMany } from "typeorm";
import { FeedItem } from "./FeedItem.js";

export enum FeedBatching {
  None,
  Weekly,
  Monthly,
  DailyBatch,
  WeeklyBatch,
  MonthlyBatch,
}

@Entity({ name: "feeds" })
export class Feed extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column()
  createdAtEpoch: number;

  @Column({ default: FeedBatching.None })
  batching: FeedBatching;

  @Column({ nullable: true })
  lastEmailSentAtEpoch: number;

  @OneToMany(() => FeedItem, (item) => item.feed)
  items: Promise<Relation<FeedItem[]>>;
}
