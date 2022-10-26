import {CampaignSetting} from "../../../components/campaign/enums/CampaignSetting";
import {ComponentType} from "../../../core/enums/ComponentType";
import {ModelClassInterface} from "./ModelClassInterface";
import {ModelInterface} from "./ModelInterface";
import {IdInterface} from "../../../services/idService/interfaces/IdInterface";
import {TFile} from "obsidian";

export interface ModelsManagerInterface {
	get(
		id: IdInterface,
		campaignSettings: CampaignSetting,
		file: TFile,
	): ModelInterface|undefined;

	register<T extends ModelInterface>(
		model: ModelClassInterface<T>,
		type: ComponentType,
		campaignSettings: CampaignSetting,
	): void;
}
