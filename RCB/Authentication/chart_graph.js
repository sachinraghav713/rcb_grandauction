
// <block:data:2>
const data = [];
const data2 = [];
let prev = 100;
let prev2 = 80;


for (let i = 0; i < 1000; i++) {
  prev += 5 - Math.random() * 10;
  data.push({x: i, y: prev});

  prev2 += 5 - Math.random() * 10;
  data2.push({x: i, y: prev2});
}
// </block:data>

// <block:animation:1>
let easing = Chart.helpers.easingEffects.easeOutQuad;
let restart = false;
const totalDuration = 5000;
const duration = (ctx) => easing(ctx.index / data.length) * totalDuration / data.length;
const delay = (ctx) => easing(ctx.index / data.length) * totalDuration;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
const animation = {
  x: {
    type: 'number',
    easing: 'linear',
    duration: duration,
    from: NaN, // the point is initially skipped
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) {
        return 0;
      }
      ctx.xStarted = true;
      return delay(ctx);
    }
  },
  y: {
    type: 'number',
    easing: 'linear',
    duration: duration,
    from: previousY,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) {
        return 0;
      }
      ctx.yStarted = true;
      return delay(ctx);
    }
  }
};
// </block:animation>

// <block:config:0>
export const config = {
  type: 'line',
  data: {
    datasets: [{
      borderColor:'red',
      borderWidth: 1,
      radius: 0,
      data: data,
    },
    {
      borderColor: 'blue',
      borderWidth: 1,
      radius: 0,
      data: data2,
    }]
  },
  options: {
    animation,
    interaction: {
      intersect: true
    },
    plugins: {
        legend: false,
        title: {
          display: true,
          text: 'RCB Trend',
          color:'white' // change this to the desired title
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Daily Trend',
            color:'white'
          }
        },
        y: {
          type: 'linear',
          title: {
            display: true,
            text: 'Upper and Lower Limits of Auction',
            color:'white'
          },
        }
    }
    
  }
};












// </block:config>

// <block:actions:2>
function restartAnims(chart) {
  chart.stop();
  const meta0 = chart.getDatasetMeta(0);
  const meta1 = chart.getDatasetMeta(1);
  for (let i = 0; i < data.length; i++) {
    const ctx0 = meta0.controller.getContext(i);
    const ctx1 = meta1.controller.getContext(i);
    ctx0.xStarted = ctx0.yStarted = false;
    ctx1.xStarted = ctx1.yStarted = false;
  }
  chart.update();
}

export const actions = [
  {
    name: 'Trending',
    handler(chart) {
      easing = helpers.easingEffects.easeOutQuad;
      restartAnims(chart);
    }
  },
  {
    name: 'easeOutCubic',
    handler(chart) {
      easing = helpers.easingEffects.easeOutCubic;
      restartAnims(chart);
    }
  },
  {
    name: 'easeOutQuart',
    handler(chart) {
      easing = helpers.easingEffects.easeOutQuart;
      restartAnims(chart);
    }
  },
  {
    name: 'easeOutQuint',
    handler(chart) {
      easing = helpers.easingEffects.easeOutQuint;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInQuad',
    handler(chart) {
      easing = helpers.easingEffects.easeInQuad;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInCubic',
    handler(chart) {
      easing = helpers.easingEffects.easeInCubic;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInQuart',
    handler(chart) {
      easing = helpers.easingEffects.easeInQuart;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInQuint',
    handler(chart) {
      easing = helpers.easingEffects.easeInQuint;
      restartAnims(chart);
    }
  },
];
// </block:actions>

export function chartProjections() {
  const canvas = document.getElementById("myCanvas");
  canvas.width = "100%";
  canvas.height = "100%";
  const ctx = canvas.getContext("2d");

  //  Destroy any existing chart on the canvas
  Chart.helpers.each(Chart.instances, function (instance) {
    try {
      if (instance.chart.canvas.id === canvas.id) {
        instance.destroy();
      }
    } catch (err) {
    }
  });
  // Create the chart
  const chart = new Chart(ctx, config);
}