import { each, get, isArray, map } from '@antv/util';
import { getActionClass, registerAction, registerInteraction, View, Element } from '@antv/g2';
import { getAllElements, getViews, getSilbingViews } from '../../../utils';

const TooltipAction = getActionClass('tooltip');

/**
 * 获取图表元素对应字段的值
 * @param element 图表元素
 * @param field 字段名
 * @ignore
 */
function getElementValue(element: Element, field) {
  const model = element.getModel();
  const record = model.data;
  let value;
  if (isArray(record)) {
    value = record[0][field];
  } else {
    value = record[field];
  }
  return value;
}

/**
 * @ignore
 * 清理 highlight 效果
 * @param view View 或者 Chart
 */
export function clearHighlight(view: View) {
  const elements = getAllElements(view);
  each(elements, (el) => {
    if (el.hasState('active')) {
      el.setState('active', false);
    }
    if (el.hasState('inactive')) {
      el.setState('inactive', false);
    }
  });
}

type AssociationItem = { element: Element; view: View; active: boolean; inactive: boolean };

/**
 * 联动变量的缓存, 多个 action 同时执行的时候，减少查找
 */
const AssociationCache: Map<string, AssociationItem[]> = new Map();

/**
 * 存在多个 view 时，控制其他 view 上的 tooltip 显示
 * @ignore
 */
class SiblingAssociation extends TooltipAction {
  /**
   * 获取关联的 elements
   * @returns Map<viewId, elements>
   */
  private getAssociationElements(views: View[]): AssociationItem[] {
    const { view, event } = this.context;
    // 获取原生事件 event.event
    const key = `$$association-cache-${event.event.timeStamp}`;
    if (AssociationCache.has(key)) {
      return AssociationCache.get(key);
    }
    AssociationCache.clear();

    const items = [];
    // 根据 groundFields 来判断是否匹配 (当前只支持一个维值)
    const groupField = get(view.getGroupScales(), [0, 'field']);
    if (groupField) {
      const data = event.data.data;
      each(views, (v: View) => {
        const elements = map(getAllElements(v), (ele) => {
          let active = false;
          let inactive = false;

          if (getElementValue(ele, groupField) === get(data, groupField)) {
            active = true;
          } else {
            inactive = true;
          }
          return { element: ele, view: v, active, inactive };
        });
        items.push(...elements);
      });
    }

    AssociationCache.set(key, items);
    return items;
  }

  /**
   * 所有同一层级的 tooltip 显示
   * @param view
   * @param point
   */
  protected showTooltip(view: View) {
    // 根据 groundFields 来判断是否匹配 (当前只支持一个维值)
    const groupField = get(view.getGroupScales(), [0, 'field']);

    if (groupField) {
      const siblingViews = getSilbingViews(view);
      const elements = this.getAssociationElements(siblingViews);

      each(elements, (ele) => {
        if (ele.active) {
          const box = ele.element.shape.getCanvasBBox();
          ele.view.showTooltip({ x: box.minX + box.width / 2, y: box.minY + box.height / 2 });
        }
      });
    }
  }

  /**
   * 隐藏同一层级的 tooltip
   * @param view
   */
  protected hideTooltip(view) {
    const siblings = getSilbingViews(view);
    each(siblings, (sibling) => {
      sibling.hideTooltip();
    });
  }

  public active() {
    const { view } = this.context;

    const views = this.cfg?.isolate ? getSilbingViews(view) : getViews(view);
    const items = this.getAssociationElements(views);

    each(items, (item) => {
      item.active && item.element.setState('active', true);
    });
  }

  public inactive() {
    const { view } = this.context;

    const views = this.cfg?.isolate ? getSilbingViews(view) : getViews(view);
    const items = this.getAssociationElements(views);

    each(items, (item) => {
      item.inactive && item.element.setState('inactive', true);
    });
  }

  public reset() {
    const { view } = this.context;

    each(view.parent.views, (v) => {
      clearHighlight(v);
    });
  }
}

const SIBLING_ASSOCIATION_ACTION = 'sibling-association';
const SIBLING_ISOLATE_ASSOCIATION_ACTION = 'sibling-isolate-association';

// @ts-ignore todo G2 补充类型定义 ActionConstructor
registerAction(SIBLING_ASSOCIATION_ACTION, SiblingAssociation);
// @ts-ignore
registerAction(SIBLING_ISOLATE_ASSOCIATION_ACTION, SiblingAssociation, { isolate: true });

/**
 * 相邻 view 的 tooltip 联动，根据 groupField 进行关联（相同维值的 tooltip 联动）
 */
registerInteraction('association-tooltip', {
  start: [{ trigger: 'element:mousemove', action: `${SIBLING_ASSOCIATION_ACTION}:show` }],
  end: [{ trigger: 'element:mouseleave', action: `${SIBLING_ASSOCIATION_ACTION}:hide` }],
});

/**
 * 相邻 view 的 active 联动（相同维值的 tooltip 联动）
 */
registerInteraction('association-active', {
  start: [{ trigger: 'element:mousemove', action: `${SIBLING_ASSOCIATION_ACTION}:active` }],
  end: [{ trigger: 'element:mouseleave', action: `${SIBLING_ASSOCIATION_ACTION}:reset` }],
});

/**
 * 相邻 view 的 active 联动, 自身不进行激活
 */
registerInteraction('association-sibling-active', {
  start: [{ trigger: 'element:mousemove', action: `${SIBLING_ISOLATE_ASSOCIATION_ACTION}:active` }],
  end: [{ trigger: 'element:mouseleave', action: `${SIBLING_ISOLATE_ASSOCIATION_ACTION}:reset` }],
});

/**
 * 相邻 view 的 highlight 联动, 突出当前 element
 */
registerInteraction('association-highlight', {
  start: [{ trigger: 'element:mousemove', action: `${SIBLING_ASSOCIATION_ACTION}:inactive` }],
  end: [{ trigger: 'element:mouseleave', action: `${SIBLING_ASSOCIATION_ACTION}:reset` }],
});

/**
 * 相邻 view 的 highlight 联动, 自身 view 不进行 highlight, 突出当前 element
 */
registerInteraction('association-sibling-highlight', {
  start: [{ trigger: 'element:mousemove', action: `${SIBLING_ISOLATE_ASSOCIATION_ACTION}:inactive` }],
  end: [{ trigger: 'element:mouseleave', action: `${SIBLING_ISOLATE_ASSOCIATION_ACTION}:reset` }],
});
