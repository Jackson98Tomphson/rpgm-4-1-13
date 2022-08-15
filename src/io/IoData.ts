import {SessionData, SessionList, SessionListInterface} from "../data/SessionData";
import {CampaignDataInterface} from "../data/CampaignData";
import {Api} from "../api";
import {DataviewInlineApi} from "obsidian-dataview/lib/api/inline-api";
import {AdventureData, AdventureList, AdventureListInterface} from "../data/AdventureData";
import {CharacterData, CharacterList, CharacterListInterface} from "../data/CharacterData";
import {ClueData, ClueDataInterface} from "../data/ClueData";
import {ImageData} from "../data/ImageData";
import {SynopsisData} from "../data/SynopsisData";
import {GenericDataListInterface} from "../interfaces/DataInterfaces";
import {DataObject} from "obsidian-dataview";
import {DataFactory} from "../factories/DataFactory";
import * as Datas from '../data';
import {ArrayFunc} from "obsidian-dataview/lib/api/data-array";
import {SceneData, SceneList, SceneListInterface} from "../data";

export enum DataType {
	Character,
	Location,
	Event,
	Clue,
	Faction,
}

export class IoData {
	private outlinks: DataObject[];

	private variableSingular: string;
	private variablePlural: string;
	private variableParentSingular: string;
	private variableParentPlural: string;

	private id: string|null = null;
	private templateFolder: string;

	constructor(
		private api: Api,
		private campaign: CampaignDataInterface|null,
		private dv: DataviewInlineApi,
		private current: Record<string, any>,
	) {
		this.outlinks = [];
		this.readOutlinks();

		const corePlugin = (this.api.app as any).internalPlugins?.plugins["templates"];
		this.templateFolder = corePlugin.instance.options.folder;

		this.current.tags.forEach((tag: string) => {
			if (tag.startsWith(this.api.settings.campaignTag)){
				this.getId(this.api.settings.campaignTag);
			} else if (tag.startsWith(this.api.settings.adventureTag)){
				this.getId(this.api.settings.adventureTag);
			} else if (tag.startsWith(this.api.settings.sessionTag)){
				this.getId(this.api.settings.sessionTag);
			} else if (tag.startsWith(this.api.settings.sceneTag)){
				this.getId(this.api.settings.sceneTag);
			}
		});

	}

	private readOutlinks(
	) : void
	{
		if (this.current != undefined){
			this.current.file.outlinks.forEach((file: Record<string,any>) => {
				const page = this.dv.page(file.path);
				if (page != undefined) {
					this.outlinks.push(page);
				}
			});
		}
	}

	private isAlreadyPresent(
		list: GenericDataListInterface,
		element: DataObject,
	): boolean
	{
		let response = false;

		list.elements.forEach((existingElement) => {
			if (element.file.path === existingElement.path){
				response = true;
				return true;
			}
		});

		return response;
	}

	private hasMainTag(
		page: Record<string, any>,
		type: DataType
	): boolean
	{
		if (page.tags == undefined){
			return false;
		}

		switch (type){
			case DataType.Character:
				return page.tags.indexOf(this.api.settings.npcTag) !== -1 || page.tags.indexOf(this.api.settings.pcTag) !== -1;
				break;
			case DataType.Clue:
				return page.tags.indexOf(this.api.settings.clueTag) !== -1;
				break;
			case DataType.Location:
				return page.tags.indexOf(this.api.settings.locationTag) !== -1;
				break;
			case DataType.Faction:
				return page.tags.indexOf(this.api.settings.factionTag) !== -1;
				break;
			case DataType.Event:
				return page.tags.indexOf(this.api.settings.eventTag) !== -1;
				break;
			default:
				return false;
				break;
		}
	}

	private getCorrectTag(
		type: DataType
	): string
	{
		let response = '';

		switch (type){
			case DataType.Character:
				response = '(#' + this.api.settings.npcTag + ' or #' + this.api.settings.pcTag + ')';
				break;
			case DataType.Clue:
				response = '#' + this.api.settings.clueTag;
				break;
			case DataType.Location:
				response = '#' + this.api.settings.locationTag;
				break;
			case DataType.Faction:
				response = '#' + this.api.settings.factionTag;
				break;
			case DataType.Event:
				response = '#' + this.api.settings.eventTag;
				break;
		}

		response += ' and #' + this.api.settings.campaignIdentifier + '/' + this.campaign?.id;

		return response;
	}

	private getId(
		identifyingTag: string,
	): void
	{
		this.current.tags.forEach((tag: string) => {
			if (tag.startsWith(identifyingTag)){
				this.id = tag.substring(tag.lastIndexOf('/') + 1);
			}
		});
	}

	public getAdventureList(
	): AdventureListInterface
	{
		const response = new AdventureList(this.campaign);

		if (this.campaign !== null) {
			const query = "#" + this.api.settings.adventureTag + " and #" + this.api.settings.campaignIdentifier + "/" + this.campaign.id;

			this.dv.pages(query)
				.where(adventure =>
					adventure.file.folder !== this.templateFolder
				)
				.sort(adventure =>
					-adventure.ids.adventure
				)
				.forEach((adventure) => {
					response.add(
						new AdventureData(
							this.api,
							adventure,
						)
					)
				});
		}

		return response;
	}

	public getSessionList(
		adventureId: string|null = null,
	): SessionListInterface
	{
		const response = new SessionList(this.campaign);

		if (this.campaign !== null) {
			const query = "#" + this.api.settings.sessionTag + (adventureId !== null ? '/' + adventureId : '') + " and #" + this.api.settings.campaignIdentifier + "/" + this.campaign.id;

			this.dv.pages(query)
				.where(session =>
					session.file.folder !== this.templateFolder
				).sort(session =>
					- this.api.getId(session.tags, this.api.settings.sessionTag)
					//	-session.ids.session
				).forEach((session) => {
					response.add(
						new SessionData(
							this.api,
							session,
						)
					)
				});
		}

		return response;
	}
	public getSceneList(
	): SceneListInterface
	{
		const response = new SceneList(this.campaign);

		if (this.campaign !== null) {
			const query = "#" + this.api.settings.sceneTag + '/' + this.id + " and #" + this.api.settings.campaignIdentifier + "/" + this.campaign.id;

			this.dv.pages(query)
				.where(page =>
					page.file.folder !== this.templateFolder
				)
				.sort(scene =>
					this.api.getId(scene.tags, this.api.settings.sceneTag)
				)
				.forEach((scene) => {
					response.add(
						new SceneData(
							this.api,
							scene,
						)
					)
				});
		}

		return response;
	}

	public getCharacterList(
	): CharacterListInterface
	{
		const response = new CharacterList(this.campaign);

		if (this.campaign !== null) {
			const query = '(#' + this.api.settings.npcTag + ' or #' + this.api.settings.pcTag + ') and #' + this.api.settings.campaignIdentifier + '/' + this.campaign.id;

			this.dv.pages(query)
				.where(character =>
					character.file.folder !== this.templateFolder
				)
				.sort(character =>
					character.file.name
				)
				.forEach((character) => {
					response.add(
						new CharacterData(
							this.api,
							character,
							this.campaign
						)
					)
				});
		}

		return response;
	}

	public getClue(
	): ClueDataInterface
	{
		return new ClueData(
			this.api,
			this.current,
		)
	}

	public getImage(
		width = 75,
		height = 75,
	): ImageData
	{
		return new ImageData(
			this.api,
			this.current,
			width,
			height,
		)
	}

	public getSynopsis(
		title: string|null = null,
	): SynopsisData
	{
		return new SynopsisData(
			this.api,
			this.current,
			title
		)
	}

	public getScene(
	): SceneData
	{
		return new SceneData(
			this.api,
			this.current,
		)
	}

	public getRelationshipList(
		type: DataType,
		parentType: DataType|null = null,
		sorting: ArrayFunc<any, any>|null = null,
	): GenericDataListInterface
	{
		//@ts-ignore
		const response = new Datas[DataType[type] + 'List'](this.campaign);

		if (this.campaign !== null) {
			this.variableSingular = DataType[type].toLowerCase();
			this.variablePlural = this.variableSingular + 's';

			const defaultSorting = function (page: Record<string, any>) {
				return page.file.name
			};

			let comparison: ArrayFunc<any, boolean>;

			if (parentType === null) {
				comparison = function (page: Record<string, any>): boolean {
					return page.file.folder !== this.templateFolder &&
						this.current.relationships != undefined &&
						this.current.relationships[this.variablePlural] != undefined &&
						this.current.relationships[this.variablePlural][page.file.name] !== undefined;
				}.bind(this);
			} else {
				this.variableParentSingular = DataType[parentType].toLowerCase();
				this.variableParentPlural = this.variableParentSingular + 's';

				comparison = function (page: Record<string, any>): boolean {
					return page.file.folder !== this.templateFolder &&
						page.relationships != undefined &&
						page.relationships[this.variableParentPlural] != undefined &&
						page.relationships[this.variableParentPlural][this.current.file.name] !== undefined;
				}.bind(this);
			}

			const query = this.getCorrectTag(type);

			this.dv.pages(query)
				.where(
					comparison
				)
				.sort(
					(sorting !== null ? sorting : defaultSorting)
				)
				.forEach((page) => {
					response.add(
						DataFactory.create(
							type,
							this.api,
							this.campaign,
							this.current,
							page,
							(parentType === null ?
									this.current.relationships[this.variablePlural][page.file.name] :
									page.relationships[DataType[parentType].toLowerCase() + 's'][this.current.file.name]
							),
						)
					)
				});

			this.outlinks.forEach((page) => {
				if (
					this.hasMainTag(page, type) &&
					!this.isAlreadyPresent(response, page)
				) {
					response.add(
						DataFactory.create(
							type,
							this.api,
							this.campaign,
							this.current,
							page,
							'_in main description_',
						)
					)
				}
			});
		}

		return response;
	}
}
