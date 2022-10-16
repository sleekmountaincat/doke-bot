import { Initialize } from "./initialize";
import { Enlist } from "./enlist";
import { Command } from "../models/command";
import { Desert } from "./desert";

export const Commands: Command[] = [Enlist, Initialize, Desert];
