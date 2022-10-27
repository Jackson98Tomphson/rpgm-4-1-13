import {SubplotDataInterface} from "../interfaces/SubplotDataInterface";
import {SubplotMetadataInterface} from "../interfaces/SubplotMetadataInterface";
import {Plots} from "../../../services/plotsServices/classes/Plots";

export abstract class AbstractSubplotData extends Plots implements SubplotDataInterface {
	protected metadata: SubplotMetadataInterface;
}
