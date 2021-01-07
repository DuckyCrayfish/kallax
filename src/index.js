import { ModelViewer } from './model-viewer.js';
import './style.css';

// DOM elements
let wrapper, rowSelect, columnSelect, widthLabel, heightLabel;

let rowCount, columnCount;
let viewer

init();

function init() {
  wrapper = document.getElementById('canvasWrapper');
  rowSelect = document.getElementById('rowSelect');
  columnSelect = document.getElementById('columnSelect');
  widthLabel = document.getElementById('widthLabel');
  heightLabel = document.getElementById('heightLabel');

  rowSelect.addEventListener('change', onSelectionChange);
  columnSelect.addEventListener('change', onSelectionChange);

  getOptionValues();

  viewer = new ModelViewer(wrapper);
  viewer.drawKallax({ rows: rowCount, columns: columnCount });
  viewer.start();

  updateDimensions();
}

function updateDimensions() {
  let width = Math.round(viewer.width * 10) / 10;
  let height = Math.round(viewer.height * 10) / 10;
  widthLabel.textContent = `${width} cm`;
  heightLabel.textContent = `${height} cm`;
}

function getOptionValues() {
  rowCount = rowSelect.value;
  columnCount = columnSelect.value;
}

function onSelectionChange() {
  getOptionValues();
  viewer.drawKallax({ rows: rowCount, columns: columnCount });
  updateDimensions();
}
