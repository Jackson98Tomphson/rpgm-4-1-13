import {AbstractHeaderView} from "../../../../REFACTOR/views/abstracts/AbstractHeaderView";
import {EventInterface} from "../interfaces/EventInterface";
import {HeaderResponseInterface} from "../../../../REFACTOR/responses/interfaces/HeaderResponseInterface";
import {HeadlessTableView} from "../../../../REFACTOR/views/HeadlessTableView";
import {HeaderResponseElementInterface} from "../../../../REFACTOR/responses/interfaces/HeaderResponseElementInterface";
import {HeaderResponseType} from "../../../../REFACTOR/responses/enums/HeaderResponseType";

export class EventHeaderView extends AbstractHeaderView {
	protected currentComponent: EventInterface;

	public render(
		container: HTMLElement,
		data: HeaderResponseInterface,
	): void {
		super.internalRender(container, data);
		const headlessTable = new HeadlessTableView(this.app, this.sourcePath);
		data.elements.forEach((element: HeaderResponseElementInterface) => {
			switch (element.type){
				case HeaderResponseType.DateSelector:
					this.createContainerEl(element, this.addDateSelector.bind(this));
					break;
				case HeaderResponseType.FantasyDateSelector:
					this.createContainerEl(element, this.addFantasyDateSelector.bind(this));
					break;
				default:
					element.value.fillContent(
						this.createContainerEl(element),
						this.sourcePath,
					);
					break;
			}
		});

		this.headerContainerEl.appendChild(headlessTable.tableEl as Node);
	}
}
