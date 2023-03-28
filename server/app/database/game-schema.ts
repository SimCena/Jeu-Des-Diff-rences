import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Difference, Ranking } from '@common/games';

export type GameDocument = Game & mongoose.Document;

@Schema()
export class Game implements Game {
    @Prop({ required: true })
    gameId: number;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    solo: Ranking[];

    @Prop({ required: true })
    multiplayer: Ranking[];

    @Prop({ required: true })
    differenceImage: Difference[];

    @Prop({ required: true })
    originalImage: string;

    @Prop({ required: true })
    modifiedImage: string;

    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);
