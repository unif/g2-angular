import { Component } from '@angular/core';

@Component({
  selector: 'dashboard',
  template: `
  <g2-chart [options]="options"
    (ready)="ready($event)"
    (destroy)="destroy()"></g2-chart>
  `
})
export class DashboardComponent {
  data = [
    { month: 'Jan', temperature: 7.0 },
    { month: 'Feb', temperature: 6.9 },
    { month: 'Mar', temperature: 9.5 },
    { month: 'Apr', temperature: 14.5 },
    { month: 'May', temperature: 18.2 },
    { month: 'Jun', temperature: 21.5 },
    { month: 'Jul', temperature: 25.2 },
    { month: 'Aug', temperature: 26.5 },
    { month: 'Sep', temperature: 23.3 },
    { month: 'Oct', temperature: 18.3 },
    { month: 'Nov', temperature: 13.9 },
    { month: 'Dec', temperature: 9.6 }
  ];
  options = {
    forceFit: true,
    height: 450,
    plotCfg: {
      margin: 100
    }
  };

  ready(chart: any) {
    const Shape = G2.Shape;

    // 自定义Shape 部分
    Shape.registShape('point', 'dashBoard', {
      drawShape: function (cfg, group) {
        let origin = cfg.origin; // 原始数据
        let value = origin.value;
        let point = cfg.points[0]; // 获取第一个标记点
        point = this.parsePoint({ // 将标记点转换到画布坐标
          x: point.x,
          y: 0.95
        });
        let center = this.parsePoint({ // 获取极坐标系下画布中心点
          x: 0,
          y: 0
        });
        let r = 20;
        let ra = 0.8 * r;
        let X1 = center.x;
        let Y1 = center.y;
        let X2 = point.x;
        let Y2 = point.y;
        let B = 150 / 180;
        let Xa, Xb, Xc, Ya, Yb, Yc; // 绘制小箭头需要的三个点
        let shape;
        if (Y1 == Y2) {
          if (X1 > X2) {
            Xa = X2 + Math.cos(B) * ra;
            Ya = Y2 - Math.sin(B) * ra;
            Xb = X2 + Math.cos(B) * ra;
            Yb = Y2 + Math.sin(B) * ra;
            Xc = X2 + 2 * ra;
            Yc = Y2;
          } else {
            Xa = X2 - Math.cos(B) * ra;
            Ya = Y2 - Math.sin(B) * ra;
            Xb = X2 - Math.cos(B) * ra;
            Yb = Y2 + Math.sin(B) * ra;
            Xc = X2 - 2 * ra;
            Yc = Y2;
          }
        } else if (Y1 > Y2) {
          let A = Math.atan((X1 - X2) / (Y1 - Y2));
          Xa = X2 + ra * Math.sin(A + B);
          Ya = Y2 + ra * Math.cos(A + B);
          Xb = X2 + ra * Math.sin(A - B);
          Yb = Y2 + ra * Math.cos(A - B);
          Xc = X2 + 2 * ra * Math.sin(A);
          Yc = Y2 + 2 * ra * Math.cos(A);
        } else {
          if (X1 > X2) {
            let A = Math.atan((Y2 - Y1) / (X1 - X2));
            Xa = X2 + ra * Math.cos(A + B);
            Ya = Y2 - ra * Math.sin(A + B);
            Xb = X2 + ra * Math.cos(A - B);
            Yb = Y2 - ra * Math.sin(A - B);
            Xc = X2 + 2 * ra * Math.cos(A);
            Yc = Y2 - 2 * ra * Math.sin(A);
          } else {
            let A = Math.atan((Y2 - Y1) / (X2 - X1));
            Xa = X2 - ra * Math.cos(A - B);
            Ya = Y2 - ra * Math.sin(A - B);
            Xb = X2 - ra * Math.cos(A + B);
            Yb = Y2 - ra * Math.sin(A + B);
            Xc = X2 - 2 * ra * Math.cos(A);
            Yc = Y2 - 2 * ra * Math.sin(A);
          }
        }
        shape = group.addShape('circle', {
          attrs: {
            x: X2,
            y: Y2,
            r: r,
            fill: cfg.color
          }
        });
        group.addShape('circle', {
          attrs: {
            x: X2,
            y: Y2,
            r: r / 2,
            fill: 'white'
          }
        });
        // 添加文本1
        group.addShape('text', {
          attrs: {
            x: X1,
            y: Y1 - 25,
            text: '当前收益率',
            fontSize: 18,
            fill: '#CCCCCC',
            textAlign: 'center'
          }
        });
        // 添加文本2
        group.addShape('text', {
          attrs: {
            x: X1,
            y: Y1 + 25,
            text: value,
            fontSize: 18,
            fill: '#F75B5B',
            textAlign: 'center'
          }
        });
        group.addShape('polygon', {
          attrs: {
            points: [
              [Xa, Ya],
              [Xc, Yc],
              [Xb, Yb],
              [Xa, Ya]
            ],
            fill: cfg.color
          }
        });
        return shape;
      }
    });
    // G2 语法部分
    let color = ['#18B7D6', '#EFCF6E', '#E47668'];
    chart.source(creatData());
    chart.coord('gauge', {
      startAngle: -9 / 8 * Math.PI,
      endAngle: 1 / 8 * Math.PI
    });
    chart.col('value', {
      min: 0,
      max: 0.15,
      tickInterval: 0.075
    });
    chart.axis('value', {
      tickLine: {
        stroke: '#EEEEEE'
      },
      labelOffset: -26
    });
    chart.point().position('value').shape('dashBoard').color('value', function (v) { // 根据值的大小确定标记的颜色
      let rst;
      if (v < 0.05) {
        rst = color[0];
      } else if (v < 0.1) {
        rst = color[1];
      } else {
        rst = color[2];
      }
      return rst;
    });
    chart.legend(false);
    draw(creatData());
    setInterval(function () {
      draw(creatData());
    }, 1000);
    function draw(data) {
      let val = data[0].value;
      let lineWidth = 30;
      chart.guide().clear();
      chart.guide().arc([0, 0.95], [0.15, 0.95], { // 底灰色
        stroke: '#CCCCCC',
        lineWidth: lineWidth
      });
      val > 0.05 && chart.guide().arc([0, 0.95], [0.05, 0.95], { // 低收益率
        stroke: color[0],
        lineWidth: lineWidth
      });
      val > 0.1 && chart.guide().arc([0.05, 0.95], [0.1, 0.95], { // 中收益率
        stroke: color[1],
        lineWidth: lineWidth
      });
      val > 0 && val <= 0.05 && chart.guide().arc([0, 0.95], [val, 0.95], { // 低收益率
        stroke: color[0],
        lineWidth: lineWidth
      });
      val > 0.05 && val <= 0.1 && chart.guide().arc([0.05, 0.95], [val, 0.95], { // 中收益率
        stroke: color[1],
        lineWidth: lineWidth
      });
      val > 0.1 && val <= 0.15 && chart.guide().arc([0.1, 0.95], [val, 0.95], { // 中收益率
        stroke: color[2],
        lineWidth: lineWidth
      });
      chart.changeData(data);
    }
    function creatData() {
      let data = [];
      let val = (Math.random() * 0.15).toFixed(3);
      data.push({ value: Number(val) });
      return data;
    }
  }

  destroy() {
    console.log('dashboard destroy');
  }
}
