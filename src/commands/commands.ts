import { Initialize } from "./initialize";
import { Enlist } from "./enlist";
import { Command } from "../models/command";
import { Desert } from "./desert";
import { Vox } from "./vox";
import { Devox } from "./devox";

export const Commands: Command[] = [Enlist, Initialize, Desert, Vox, Devox];
