/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Breadcrumb
 */

import { TreeDataProvider, TreeNodeItem } from "../tree/TreeDataProvider";
import { UiEvent } from "@bentley/ui-core";

/** BreadcrumbChangeEvent Event Args class.
 * @beta
 */
export interface BreadcrumbUpdateEventArgs {
  dataProvider: TreeDataProvider;
  oldDataProvider: TreeDataProvider;
  currentNode: TreeNodeItem | undefined;
}

/** BreadcrumbChangeEvent Event class.
 * @beta
 */
export class BreadcrumbUpdateEvent extends UiEvent<BreadcrumbUpdateEventArgs> { }

/** Breadcrumb Path class.
 * @beta
 */
export class BreadcrumbPath {
  private _dataProvider: TreeDataProvider;
  private _currentNode: TreeNodeItem | undefined = undefined;
  private _breadcrumbUpdateEvent: BreadcrumbUpdateEvent = new BreadcrumbUpdateEvent();

  public get BreadcrumbUpdateEvent(): BreadcrumbUpdateEvent { return this._breadcrumbUpdateEvent; }

  constructor(dataProvider: TreeDataProvider) {
    this._dataProvider = dataProvider;
  }

  public getDataProvider() {
    return this._dataProvider;
  }
  public setDataProvider(dataProvider: TreeDataProvider) {
    this.BreadcrumbUpdateEvent.emit({ dataProvider, oldDataProvider: this._dataProvider, currentNode: this._currentNode });
    this._dataProvider = dataProvider;
  }

  public getCurrentNode() {
    return this._currentNode;
  }

  public setCurrentNode(currentNode: TreeNodeItem | undefined) {
    this.BreadcrumbUpdateEvent.emit({ dataProvider: this._dataProvider, oldDataProvider: this._dataProvider, currentNode });
    this._currentNode = currentNode;
  }
}
