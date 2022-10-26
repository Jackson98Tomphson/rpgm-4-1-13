import {Plots} from "../../../services/plotsServices/Plots";
import {ActDataInterface} from "../interfaces/ActDataInterface";
import {ActMetadataInterface} from "../interfaces/ActMetadataInterface";
import {AbtStage} from "../../../services/plotsServices/enums/AbtStage";

export abstract class AbstractActData extends Plots implements  ActDataInterface {
	protected metadata: ActMetadataInterface;

	public get abtStage(): AbtStage|undefined {
		if (this.metadata.data?.abtStage == undefined || this.metadata.data.abtStage === '')
			return undefined;

		return this.factories.abtStage.createAbtStage(this.metadata.data.abtStage);
	}
}
