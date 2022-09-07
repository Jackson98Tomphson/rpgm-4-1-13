import {App, MarkdownView} from "obsidian";
import {DataType} from "../enums/DataType";
import {ModalFactory, SingleModalKey} from "./ModalFactory";
import {CampaignSetting} from "../enums/CampaignSetting";
import {SingleTemplateKey, TemplateFactory} from "./TemplateFactory";
import {CampaignInterface} from "../interfaces/data/CampaignInterface";
import {AbstractFactory} from "../abstracts/AbstractFactory";

export class FileFactory extends AbstractFactory {
	public async create(
		type: DataType,
		create: boolean,
		createFrontMatterOnly: boolean,
		name: string,
		campaignId: number|null=null,
		adventureId: number|null = null,
		sessionId: number|null = null,
		sceneId: number|null = null,
	): Promise<void> {
		const settings = this.getSettings(campaignId);

		const template = this.app.plugins.getPlugin('rpg-manager').factories.templates.create(
			CampaignSetting[settings] + DataType[type] as SingleTemplateKey<any>,
			createFrontMatterOnly,
			name,
			campaignId,
			adventureId,
			sessionId,
			sceneId,
		);

		const data: string = template.generateData();

		if (create) {
			const newFile = await app.vault.create(name + '.md', data);
			const leaf = app.workspace.getLeaf(true);
			await leaf.openFile(newFile);
		} else {
			const activeView = app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView != null) {
				const editor = activeView.editor;
				editor.setValue(data + '\n' + editor.getValue());
			}
		}
	}

	public async silentCreate(
		app: App,
		type: DataType,
		name: string,
		campaignId: number,
		adventureId: number|null = null,
		sessionId: number|null = null,
		sceneId: number|null = null,
	): Promise<void> {
		const settings = this.getSettings(campaignId);

		const template = this.app.plugins.getPlugin('rpg-manager').factories.templates.create(
			CampaignSetting[settings] + DataType[type] as SingleTemplateKey<any>,
			false,
			name,
			campaignId,
			adventureId,
			sessionId,
			sceneId,
		);

		const data: string = template.generateData();
		const newFile = await app.vault.create(name + '.md', data);
		const leaf = app.workspace.getLeaf(true);
		await leaf.openFile(newFile);
	}

	private getSettings(
		campaignId: number|null,
	): CampaignSetting {
		let response: CampaignSetting = CampaignSetting.Agnostic;

		if (campaignId != null){
			const campaign: CampaignInterface|null = this.app.plugins.getPlugin('rpg-manager').io.getCampaign(campaignId);

			if (campaign != null){
				response = campaign.settings;
			}
		}

		return response;
	}
}
