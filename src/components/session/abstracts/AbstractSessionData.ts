import {SessionDataInterface} from "../interfaces/SessionDataInterface";
import {SessionMetadataInterface} from "../interfaces/SessionMetadataInterface";
import {AbtStage} from "../../../services/plotsServices/enums/AbtStage";
import {Plots} from "../../../services/plotsServices/classes/Plots";
import {DateInterface} from "../../../services/dateService/interfaces/DateInterface";
import {DateService} from "../../../services/dateService/DateService";
import {PlotService} from "../../../services/plotsServices/PlotService";

export class AbstractSessionData extends Plots implements SessionDataInterface {
	protected metadata: SessionMetadataInterface;

	public get irl(): DateInterface | undefined {
		return this.api.service(DateService).getDate(
			this.metadata.data?.irl,
			undefined,
			this,
		);
	}

	public get abtStage(): AbtStage|undefined {
		if (this.metadata.data?.abtStage == undefined) return undefined;
		return this.api.service(PlotService).getAbtStage(this.metadata.data.abtStage);
	}

	public get targetDuration(): number|undefined {
		return this.metadata.data?.targetDuration;
	}
}
