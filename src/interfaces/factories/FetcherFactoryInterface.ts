import {App} from "obsidian";
import {FetcherInterface} from "../FetcherInterface";

export interface FetcherFactoryInterface {
	create<T extends FetcherInterface>(
		fetcherType: (new (app: App) => T),
	): Promise<T>;
}
