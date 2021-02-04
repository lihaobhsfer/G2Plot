import { Chart } from '@antv/g2';
import { getAdaptor } from '../../../../src/plots/multi-view/utils';
import { createDiv } from '../../../utils/dom';

describe('utils', () => {
  it('get-adaptor: normal line', () => {
    const lineAdaptor = getAdaptor('line');

    const chart = new Chart({ container: createDiv(), width: 200, height: 400 });
    lineAdaptor({
      chart,
      options: {
        data: [
          { x: '1', y: 2 },
          { x: '2', y: 1 },
        ],
        xField: 'x',
        yField: 'y',
        point: {},
      },
    });

    chart.render();

    expect(chart.geometries.length).toBe(2);
    expect(chart.geometries[0].elements.length).toBe(1);
    expect(chart.geometries[1].elements.length).toBe(2);
  });

  it('get-adaptor: normal pie', () => {
    const pieAdaptor = getAdaptor('pie');

    const chart = new Chart({ container: createDiv(), width: 200, height: 400 });
    pieAdaptor({
      chart,
      options: {
        data: [
          { x: '1', y: 2 },
          { x: '2', y: 1 },
        ],
        angleField: 'y',
        colorField: 'x',
      },
    });

    chart.render();

    expect(chart.geometries.length).toBe(1);
    expect(chart.geometries[0].elements.length).toBe(2);
    expect(chart.getCoordinate().isPolar).toBe(true);
  });

  it('get-adaptor: innoraml', () => {
    // @ts-ignore 不支持 xxx
    const adaptor = getAdaptor('xxx');
    expect(adaptor).toBe(null);
  });

  it('get-adaptor: 不支持再引入 multi-view', () => {
    // @ts-ignore 不支持 multi-view
    const adaptor = getAdaptor('multi-view');
    expect(adaptor).toBe(null);
  });
});
