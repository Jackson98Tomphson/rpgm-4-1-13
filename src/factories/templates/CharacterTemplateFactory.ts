import {AbstractTemplateFactory} from "../../abstracts/AbstractTemplateFactory";
import {RpgCodeBlockInterface} from "../../interfaces/RpgCodeBlockInterface";

export class CharacterTemplateFactory extends AbstractTemplateFactory {
	public addFrontmatterData(
		frontmatter: any,
	): void {
		super.addFrontmatterData(frontmatter);
		frontmatter.tags.push(this.app.plugins.getPlugin('rpg-manager').settings.pcTag + '/' + this.campaignId);
		frontmatter.relationships = {
			characters: {},
			locations: {},
			factions: {},
		};
		frontmatter.pronoun = "";
		frontmatter.dates = {
			dob: {},
			death: {},
		}
	}

	public generateInitialCodeBlock(
	): string|undefined {
		return this.generateRpgManagerCodeBlock(
			'pc',
		);
	}
}
