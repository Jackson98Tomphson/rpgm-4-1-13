import {AbstractFactory} from "../abstracts/AbstractFactory";
import {App} from "obsidian";
import {FetcherInterface} from "../interfaces/FetcherInterface";
import {FetcherFactoryInterface} from "../interfaces/factories/FetcherFactoryInterface";

export class FetcherFactory extends AbstractFactory implements FetcherFactoryInterface{
	public async create<T extends FetcherInterface>(
		fetcherType: (new (app: App) => T),
	): Promise<T> {
		return new fetcherType(this.app);
	}
}
