import {App, Plugin_2, PluginSettingTab, TAbstractFile, TFolder} from "obsidian";
import {SettingsUpdater} from "./SettingsUpdater";
import {RpgManagerInterface} from "../interfaces/RpgManagerInterface";
import {SettingsFactory} from "../factories/SettingsFactory";
import {RpgManagerSettingsInterface} from "./RpgManagerSettingsInterface";
import {SettingType} from "../enums/SettingType";
import {SettingInterface} from "../interfaces/SettingsInterface";
import {TagHelper} from "../helpers/TagHelper";

export class RpgManagerSettings extends PluginSettingTab {
	private plugin: RpgManagerInterface;
	private settingsFactory: SettingsFactory;
	private settingsUpdater: SettingsUpdater;
	private map: Map<SettingType, SettingInterface>;
	public containerEl: HTMLElement;
	private templateFolderMap: Map<string, string>;

	constructor(
		app: App,
	) {
		super(
			app,
			(<unknown>app.plugins.getPlugin('rpg-manager')) as Plugin_2,
		);

		this.plugin = app.plugins.getPlugin('rpg-manager');

		const {containerEl} = this;
		this.containerEl = containerEl;

		this.map = new Map();
		this.map.set(SettingType.Campaign, {title: 'Campaign', value: this.plugin.settings.campaignTag, placeholder: 'rpgm/outline/campaign'});
		this.map.set(SettingType.Adventure, {title: 'Adventure', value: this.plugin.settings.adventureTag, placeholder: 'rpgm/outline/adventure'});
		this.map.set(SettingType.Act, {title: 'Act', value: this.plugin.settings.actTag, placeholder: 'rpgm/outline/act'});
		this.map.set(SettingType.Scene, {title: 'Scene', value: this.plugin.settings.sceneTag, placeholder: 'rpgm/outline/scene'});
		this.map.set(SettingType.Session, {title: 'Session', value: this.plugin.settings.sessionTag, placeholder: 'rpgm/outline/session'});
		this.map.set(SettingType.Subplot, {title: 'Subplot', value: this.plugin.settings.subplotTag, placeholder: 'rpgm/outline/subplot'});
		this.map.set(SettingType.PC, {title: 'Player Character', value: this.plugin.settings.pcTag, placeholder: 'rpgm/element/character/pc'});
		this.map.set(SettingType.NPC, {title: 'Non Player Character', value: this.plugin.settings.npcTag, placeholder: 'rpgm/element/character/npc'});
		this.map.set(SettingType.Location, {title: 'Location', value: this.plugin.settings.locationTag, placeholder: 'rpgm/element/location'});
		this.map.set(SettingType.Faction, {title: 'Faction', value: this.plugin.settings.factionTag, placeholder: 'rpgm/element/faction'});
		this.map.set(SettingType.Clue, {title: 'Clue', value: this.plugin.settings.eventTag, placeholder: 'rpgm/element/event'});
		this.map.set(SettingType.Event, {title: 'Event', value: this.plugin.settings.clueTag, placeholder: 'rpgm/element/clue'});
		this.map.set(SettingType.Music, {title: 'Music', value: this.plugin.settings.musicTag, placeholder: 'rpgm/element/music'});

		this.map.set(SettingType.YouTubeApiKey, {title: 'YouTube API Key', value: this.plugin.settings.YouTubeKey, placeholder: 'Your YouTube API Key'});
		this.map.set(SettingType.automaticMove, {title: 'Automatically organise elements in folders', value: this.plugin.settings.automaticMove, placeholder: 'Organise new elements'});
		this.map.set(SettingType.templateFolder, {title: 'Template folder', value: this.plugin.settings.templateFolder, placeholder: 'Template Folder'});

		this.settingsUpdater = new SettingsUpdater(this.app);
		this.settingsFactory = new SettingsFactory(this.plugin, this.map, this.containerEl);
	}

	display(): void {
		this.containerEl.empty();

		this.createTemplateFolderMap();

		this.settingsFactory.createHeader('CampaignSetting for Role Playing Game Manager');

		this.loadTemplatesSettings();
		this.loadExternalServicesSettings();
		this.loadComponentSettings();

		const saveButtonEl = this.containerEl.createEl('button');
		const saved = this.containerEl.createEl('p', {text: 'Settings Saved'});
		saved.style.display = 'none';
		saveButtonEl.textContent = 'Save Settings';
		saveButtonEl.addEventListener("click", () => {
			saved.style.display = 'none';
			this.saveSettings()
				.then((response: string) => {
					saved.textContent = response;
					saved.style.display = 'block';
				});
		});
	}

	private async saveSettings(
	): Promise<string> {
		let response = 'No changes to the settings have been made.';
		const updatedTags: Map<string, string> = new Map();

		let doUpdate = false;
		const settingsToUpdate: Partial<RpgManagerSettingsInterface> = {};

		if (this.plugin.settings.campaignTag !== this.map.get(SettingType.Campaign)?.value) {
			settingsToUpdate.campaignTag = this.map.get(SettingType.Campaign)?.value;
			updatedTags.set(this.plugin.settings.campaignTag, this.map.get(SettingType.Campaign)?.value);
		}

		if (this.plugin.settings.adventureTag !== this.map.get(SettingType.Adventure)?.value) {
			settingsToUpdate.adventureTag = this.map.get(SettingType.Adventure)?.value;
			updatedTags.set(this.plugin.settings.adventureTag, this.map.get(SettingType.Adventure)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.actTag !== this.map.get(SettingType.Act)?.value) {
			settingsToUpdate.actTag = this.map.get(SettingType.Act)?.value;
			updatedTags.set(this.plugin.settings.actTag, this.map.get(SettingType.Act)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.sceneTag !== this.map.get(SettingType.Scene)?.value) {
			settingsToUpdate.sceneTag = this.map.get(SettingType.Scene)?.value;
			updatedTags.set(this.plugin.settings.sceneTag, this.map.get(SettingType.Scene)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.sessionTag !== this.map.get(SettingType.Session)?.value) {
			settingsToUpdate.sessionTag = this.map.get(SettingType.Session)?.value;
			updatedTags.set(this.plugin.settings.sessionTag, this.map.get(SettingType.Session)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.subplotTag !== this.map.get(SettingType.Subplot)?.value) {
			settingsToUpdate.subplotTag = this.map.get(SettingType.Subplot)?.value;
			updatedTags.set(this.plugin.settings.subplotTag, this.map.get(SettingType.Subplot)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.pcTag !== this.map.get(SettingType.PC)?.value) {
			settingsToUpdate.pcTag = this.map.get(SettingType.PC)?.value;
			updatedTags.set(this.plugin.settings.pcTag, this.map.get(SettingType.PC)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.npcTag !== this.map.get(SettingType.NPC)?.value) {
			settingsToUpdate.npcTag = this.map.get(SettingType.NPC)?.value;
			updatedTags.set(this.plugin.settings.npcTag, this.map.get(SettingType.NPC)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.factionTag !== this.map.get(SettingType.Faction)?.value) {
			settingsToUpdate.factionTag = this.map.get(SettingType.Faction)?.value;
			updatedTags.set(this.plugin.settings.factionTag, this.map.get(SettingType.Faction)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.locationTag !== this.map.get(SettingType.Location)?.value) {
			settingsToUpdate.locationTag = this.map.get(SettingType.Location)?.value;
			updatedTags.set(this.plugin.settings.locationTag, this.map.get(SettingType.Location)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.eventTag !== this.map.get(SettingType.Event)?.value) {
			settingsToUpdate.eventTag = this.map.get(SettingType.Event)?.value;
			updatedTags.set(this.plugin.settings.eventTag, this.map.get(SettingType.Event)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.clueTag !== this.map.get(SettingType.Clue)?.value) {
			settingsToUpdate.clueTag = this.map.get(SettingType.Clue)?.value;
			updatedTags.set(this.plugin.settings.clueTag, this.map.get(SettingType.Clue)?.value);
			doUpdate = true;
		}

		if (this.plugin.settings.musicTag !== this.map.get(SettingType.Music)?.value) {
			settingsToUpdate.musicTag = this.map.get(SettingType.Music)?.value;
			updatedTags.set(this.plugin.settings.musicTag, this.map.get(SettingType.Music)?.value);
			doUpdate = true;
		}

		if (doUpdate){
			await this.plugin.updateSettings(settingsToUpdate);
			this.plugin.tagHelper = new TagHelper(this.plugin.settings);
			await this.settingsUpdater.updateTags(updatedTags);

			response = 'Settings saved and database re-initialised';
		}

		return response;
	}

	private loadComponentSettings(
	): void {
		this.settingsFactory.createHeader('Component tags', 3, 'Set your preferred tags to identify each component');
		this.settingsFactory.createWarning(`Changes will be saved only after pressing the button below. The tags will be updates in your notes.`);

		this.settingsFactory.createTextSetting(SettingType.Campaign, 'The main plot');
		this.settingsFactory.createTextSetting(SettingType.Adventure, 'Storylines inside a campaign');
		this.settingsFactory.createTextSetting(SettingType.Act, 'Parts of an adventure');
		this.settingsFactory.createTextSetting(SettingType.Scene, 'Encounters');
		this.settingsFactory.createTextSetting(SettingType.Session, 'In-real-life gaming session, encompassing multiple scenes');
		this.settingsFactory.createTextSetting(SettingType.Subplot, 'Alternative plots to the main one, grouping events and clues');
		this.settingsFactory.createTextSetting(SettingType.PC, 'Characters managed by players');
		this.settingsFactory.createTextSetting(SettingType.NPC, 'Characters managed by the storyteller');
		this.settingsFactory.createTextSetting(SettingType.Location, 'Physical places in the game');
		this.settingsFactory.createTextSetting(SettingType.Faction, 'Group of characters');
		this.settingsFactory.createTextSetting(SettingType.Event, 'Something that happened amongst non player characters');
		this.settingsFactory.createTextSetting(SettingType.Clue, 'Infomration for the player characters');
		this.settingsFactory.createTextSetting(SettingType.Music, 'Links to songs or playlist to associate to scenes');
	}

	private loadExternalServicesSettings(
	): void {
		this.settingsFactory.createHeader('External Services', 3);
		this.settingsFactory.createWarning(`Configurations are saved in a file in your vault. If you share your vault, you share your key!`);

		this.settingsFactory.createTextSetting(
			SettingType.YouTubeApiKey,
			`Used to access YouTube-specific information`,
		);
	}

	private loadTemplatesSettings(
	): void {
		this.settingsFactory.createHeader('Component creations', 3, 'Manage how new components are created');

		this.settingsFactory.createDropdownSetting(
			SettingType.templateFolder,
			`Select the folder in which you keep the templates for RPG Manager.`,
			this.templateFolderMap,
		)

		this.settingsFactory.createToggleSetting(
			SettingType.automaticMove,
			`Keeps your structure organised by creating subfolders for your Outlines and Elements`,
		);
	}

	private createTemplateFolderMap(
		parent: TFolder|undefined=undefined,
	): void {
		let folderList: TAbstractFile[] = [];
		if (parent != undefined) {
			folderList = parent.children.filter((file: TAbstractFile) => file instanceof TFolder);
		} else {
			this.templateFolderMap = new Map();
			folderList = this.app.vault.getRoot().children.filter((file: TAbstractFile) => file instanceof TFolder);
		}

		folderList.forEach((folder: TFolder) => {
			this.templateFolderMap.set(folder.path, folder.path);
			this.createTemplateFolderMap(folder);
		});
	}
}
