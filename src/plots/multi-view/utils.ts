import { Adaptor } from '../../core/adaptor';
import { adaptor as lineAdaptor } from '../line/adaptor';
import { adaptor as pieAdaptor } from '../pie/adaptor';
import { adaptor as columnAdaptor } from '../column/adaptor';
import { adaptor as barAdaptor } from '../bar/adaptor';
import { adaptor as areaAdaptor } from '../area/adaptor';
import { adaptor as gaugeAdaptor } from '../gauge/adaptor';
import { adaptor as tinyLineAdaptor } from '../tiny-line/adaptor';
import { adaptor as tinyColumnAdaptor } from '../tiny-column/adaptor';
import { adaptor as tinyAreadaptor } from '../tiny-area/adaptor';
import { adaptor as ringProgressAdaptor } from '../ring-progress/adaptor';
import { adaptor as progressAdaptor } from '../progress/adaptor';
import { LineOptions } from '../line';
import { PieOptions } from '../pie';
import { BarOptions } from '../bar';
import { ColumnOptions } from '../column';
import { AreaOptions } from '../area';
import { GaugeOptions } from '../gauge';
import { TinyLineOptions } from '../tiny-line';
import { TinyAreaOptions } from '../tiny-area';
import { TinyColumnOptions } from '../tiny-column';
import { RingProgressOptions } from '../ring-progress';
import { ProgressOptions } from '../progress';

/**
 * 移除 options 中的 width、height 设置
 */
type OmitSize<T> = Omit<T, 'width' | 'height'>;

/**
 * multi-view 中的支持的 plots 类型（带 options 定义）
 */
export type IPlotTypes =
  | {
      /**
       * plot 类型
       */
      readonly type: 'line';
      /**
       * plot 配置
       */
      readonly options: OmitSize<LineOptions>;
    }
  | {
      readonly type: 'pie';
      readonly options: OmitSize<PieOptions>;
    }
  | {
      readonly type: 'bar';
      readonly options: OmitSize<BarOptions>;
    }
  | {
      readonly type: 'column';
      readonly options: OmitSize<ColumnOptions>;
    }
  | {
      readonly type: 'area';
      readonly options: OmitSize<AreaOptions>;
    }
  | {
      readonly type: 'gauge';
      readonly options: OmitSize<GaugeOptions>;
    }
  | {
      readonly type: 'tiny-line';
      readonly options: OmitSize<TinyLineOptions>;
    }
  | {
      readonly type: 'tiny-area';
      readonly options: OmitSize<TinyAreaOptions>;
    }
  | {
      readonly type: 'tiny-column';
      readonly options: OmitSize<TinyColumnOptions>;
    }
  | {
      readonly type: 'ring-progress';
      readonly options: OmitSize<RingProgressOptions>;
    }
  | {
      readonly type: 'progress';
      readonly options: OmitSize<ProgressOptions>;
    };

/**
 * 可在 multi-view 中使用的 plots
 */
const PLOT_ADAPTORS = {
  line: lineAdaptor,
  pie: pieAdaptor,
  column: columnAdaptor,
  bar: barAdaptor,
  area: areaAdaptor,
  gauge: gaugeAdaptor,
  'tiny-line': tinyLineAdaptor,
  'tiny-column': tinyColumnAdaptor,
  'tiny-area': tinyAreadaptor,
  'ring-progress': ringProgressAdaptor,
  progress: progressAdaptor,
};

/**
 * 获取指定 plot 的 adaptor
 * @param plot
 */
export function getAdaptor<T extends IPlotTypes['type']>(plot: T): Adaptor<IPlotTypes['options']> | null {
  const module = PLOT_ADAPTORS[plot];
  if (!module) {
    console.error(`could not find ${plot} plot`);
    return null;
  }
  return module;
}
