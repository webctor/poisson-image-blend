/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { html } from '@polymer/lit-element';
import { PageViewElement } from './page-view-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

// This element is connected to the Redux store.
import { store } from '../store.js';

// These are the actions needed by this element.
import { checkout } from '../actions/shop.js';

// We are lazy loading its reducer.
import shop, { cartQuantitySelector } from '../reducers/shop.js';

import '@polymer/iron-image/iron-image.js';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-button/paper-button';

store.addReducers({
  shop
});

// These are the elements needed by this element.
import '../components/my-header.js';

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';
import { ButtonSharedStyles } from './button-shared-styles.js';
import { addToCartIcon } from './my-icons.js';

const JsonType = {
  fromAttribute: (attr) => { return JSON.parse(attr) },
  toAttribute:   (prop) => { return JSON.stringify(prop) }
}


const base_ctx = null;
const src_ctx = null;
const mask_ctx = null;


class MyView4 extends connect(store)(PageViewElement) {

  render() {
    return html`
      ${SharedStyles}
      ${ButtonSharedStyles}
      
      <style>               
        iron-image {
            width: 100%;
            height: 100px;           
        }
        
        .container {
            display: flex;
            flex-direction: row;
        }
        
        .container > div {          
          margin: 10px;
          font-size: 30px;
        }
        
        .workspace {
            justify-content: center;
        }
        
        .workitem {
            flex-grow: 1;
            flex-direction: column;
            margin: auto;
        }
        
        span {
            font-size: small;
        }
      </style>

      <section>
        <h2>Poisson Image Editor</h2>
        <ol>
            <li>Select a source image</li>
            <li>Select a background image</li>
            <li>Draw a mask using your mouse</li>
            <li>Place the mask over the background in the desired position</li>
            <li>Merge!</li>
        </ol>
      </section>
      <section>
        <h3>Select Images</h3>
        <div class="container">
            <div class="workitem">
                <div>
                    <span>source: </span>
                    <input type="file" id="src-file" @change="${(e) => this.loadSourceFile(e.target.files[0])}"/>
                </div>
                <div>
                    <canvas id="mask-canvas" height="300px" width="400px"
                      @mousemove="${(e) => this.drawMask(e)}"
                      @mousedown="${(e) => this.startDrawing(e)}"
                      @mouseup="${(e) => this.finishDrawing(e)}"></canvas>
                </div>
            </div>
            
            <div class="workitem">
                <div>
                    <span>background: </span>
                    <input type="file" id="base-file" @change="${(e) => this.loadBaseFile(e.target.files[0])}"/>
                </div>
                <div>
                    <canvas id="result-canvas" height="300px" width="400px" 
                      @mousedown="${(e) => this.startMoveMask(e)}"
                      @mouseup="${(e) => this.stopMoveMask(e)}"
                      @mousemove="${(e) => this.moveMask(e)}"></canvas>
                </div>
            </div>
        </div>
        
        <div> 
          <iron-image hidden 
                      id="src-img"
                      width="0"
                      height="0"
                      src="${this.srcimg}" 
                      placeholder="images/default-placeholder.png"                    
                      sizing="cover"
                      preload="false"
                      fade="false"
                      alt="Source Image"
                      @loaded-changed="${(e) => this.srcimgloaded(e)}">
                  </iron-image>                             
          <iron-image hidden 
                      id="base-img"
                      width="0"
                      height="0"
                      src="${this.baseimg}" 
                      placeholder="images/default-placeholder.png"                    
                      sizing="cover"
                      preload="false"
                      fade="false"
                      alt="Source Image"
                      @loaded-changed="${(e) => this.baseimgloaded(e)}">
                  </iron-image>                
        </div>
        
        <div>
            <paper-button @click="${() => this.blendImages()}">Start Merging!</paper-button>
        </div>
      </section>
           
    `;
  }

  constructor() {
    super();
    this.mask_canvas_offset = {x:0, y:0};
    this.old_point = {x:0, y:0};
    this.old_mpoint = {x:0, y:0};
    this.base_size = { width: 400, height: 300};
    this.blend_position_offset = { x : 0, y : 0 };
    this.baseimg = "";
    this.srcimg = "";
    this.drawing = false;

  }

  srcimgloaded(e) {
    this.mask_ctx = this.shadowRoot.querySelector('#mask-canvas').getContext("2d");
    var simg = new Image();
    simg.src = this.shadowRoot.querySelector('#src-img').src;
    this.mask_ctx.drawImage(simg, 0, 0,  400, 300);

    if(this.shadowRoot.querySelector('#src-img').src !== undefined && this.shadowRoot.querySelector('#src-img').src !== '') {
      var sctx = document.createElement("canvas");
      this.src_ctx = sctx.getContext("2d");
      sctx.height = 300;
      sctx.width = 400;

      this.src_ctx.drawImage(simg, 0, 0, 400, 300);
    }

  }

  baseimgloaded(e) {
    this.result_ctx = this.shadowRoot.querySelector('#result-canvas').getContext("2d");
    this.base_ctx = this.shadowRoot.querySelector('#result-canvas').getContext("2d");
    var bimg = new Image();
    bimg.src = this.shadowRoot.querySelector('#base-img').src;

    this.base_ctx.drawImage(bimg, 0, 0, 400, 300);
    this.result_ctx.drawImage(bimg, 0, 0,  400, 300);

  }

  calMaskCanvasOffset() {

    var bounds = this.shadowRoot.querySelector('#mask-canvas').getBoundingClientRect();

    this.mask_canvas_offset.x = bounds.left;
    this.mask_canvas_offset.y = bounds.top;
  }

  drawMask(e) {
    //var mask_ctx = this.shadowRoot.querySelector('#mask-canvas').getContext("2d");

    if(this.drawing) {
      var x = e.clientX - this.mask_canvas_offset.x;
      var y = e.clientY - this.mask_canvas_offset.y;

      this.mask_ctx.strokeStyle = "rgba(0,255,0,1.0)";
      this.mask_ctx.lineWidth = 10;
      // this.mask_ctx.lineJoin = "round";
      this.mask_ctx.lineCap = "round";
      this.mask_ctx.beginPath();

      this.mask_ctx.moveTo(this.old_point.x, this.old_point.y);
      this.mask_ctx.lineTo(x, y);

      this.mask_ctx.stroke();
      this.mask_ctx.closePath();

      this.old_point.x = x;
      this.old_point.y = y;
    }
  }

  startDrawing(e) {
    this.calMaskCanvasOffset();
    this.drawing = true;
    this.old_point.x = e.clientX - this.mask_canvas_offset.x;
    this.old_point.y = e.clientY - this.mask_canvas_offset.y;
  }

  finishDrawing(e) {
    this.drawing = false;
    // set the mask on top of base
    this.getMaskFeatures();
  }

  initializeResultCtx() {
    // var result_pixels = this.result_ctx.getImageData(0, 0, this.base_size.width, this.base_size.height);
    for(var i=0; i<this.result_pixels.data.length; i++) {
      this.result_pixels.data[i] = 255;
    }

    var bimg = new Image();
    bimg.src = this.shadowRoot.querySelector('#base-img').src;

    this.result_ctx.putImageData(this.result_pixels, 0, 0);
    this.result_ctx.drawImage(bimg, 0, 0, this.base_size.width, this.base_size.height);
  }

  getMaskFeatures() {
    this.mask_ctx = this.shadowRoot.querySelector('#mask-canvas').getContext("2d");
    this.src_pixels = this.src_ctx.getImageData(0, 0, this.base_size.width, this.base_size.height);
    this.mask_pixels = this.mask_ctx.getImageData(0, 0, this.base_size.width, this.base_size.height);
    this.result_pixels = this.result_ctx.getImageData(0, 0, this.base_size.width, this.base_size.height);



    for(var y=1; y < this.base_size.height-1; y++) {
      for(var x=1; x < this.base_size.width-1; x++) {
        var p = (y * this.base_size.width + x) * 4;
        if(this.mask_pixels.data[p+0]==0 && this.mask_pixels.data[p+1]==255 &&
            this.mask_pixels.data[p+2]==0 && this.mask_pixels.data[p+3]==255) {

          var poff = p + 4 * ((this.blend_position_offset.y) * this.base_size.width + this.blend_position_offset.x);
          for(var ch = 0; ch < 3; ch++) {
            this.result_pixels.data[poff + ch] = this.src_pixels.data[p + ch];
          }
        }
      }
    }

    this.result_ctx.putImageData(this.result_pixels, 0, 0);

  }

  startMoveMask(e) {

      this.draggable = true;
      this.old_mpoint.x = e.clientX - this.blend_position_offset.x;
      this.old_mpoint.y = e.clientY - this.blend_position_offset.y;

    return false;
  }

  stopMoveMask(e) {
      this.draggable = false;
  }

  moveMask(e) {
      if(this.draggable) {
        var mx = e.clientX - this.blend_position_offset.x;
        var my = e.clientY - this.blend_position_offset.y;

        this.old_mpoint.x = mx;
        this.old_mpoint.y = my;

        this.blend_position_offset.x = mx;
        this.blend_position_offset.y = my;

        this.initializeResultCtx();
        this.getMaskFeatures();

        return false;
      }
  }

  blendImages() {


    var base_pixels = this.base_ctx.getImageData(0, 0, this.base_size.width, this.base_size.height);

    var dx, absx, base=1.0;

    do {
      dx=0; absx=0;
      for(var y = 1; y < this.base_size.height - 1; y++) {
        for(var x = 1; x < this.base_size.width - 1; x++) {
          // current pixel
          var p = ( y * this.base_size.width + x) * 4;

          if(this.mask_pixels.data[p + 0] == 0 && this.mask_pixels.data[p + 1] == 255 &&
              this.mask_pixels.data[p + 2] == 0 && this.mask_pixels.data[p + 3] == 255) {
            // if the current pixel part of the mask, then this is our Omega

            var poff = p + 4 * (this.blend_position_offset.y * this.base_size.width + this.blend_position_offset.x);

            // get the connected neighbors, now known as q (using nomenclature as in the paper)
            var q = [((y - 1) * this.base_size.width + x) * 4, ((y + 1) * this.base_size.width + x) * 4,
              (y * this.base_size.width + (x - 1)) * 4, (y * this.base_size.width+(x + 1)) * 4];
            var num_neighbors = q.length; // <-- now, for each element of the nighborhood, process per channel (RGB)

            for(var ch = 0; ch < 3; ch++) {
              var sum_fq = 0;
              var sum_vpq = 0; // v( p + q2 ) on the oriented edge [p,q]
              var sum_boundary = 0;

              for(var i = 0; i < num_neighbors; i++) {
                var qoff = q[i] + 4 * (this.blend_position_offset.y * this.base_size.width + this.blend_position_offset.x);

                if(this.mask_pixels.data[q[i] + 0] == 0 && this.mask_pixels.data[q[i] + 1] == 255 &&
                    this.mask_pixels.data[q[i] + 2] == 0 && this.mask_pixels.data[q[i] + 3] == 255) {
                  sum_fq += this.result_pixels.data[qoff + ch];
                } else {
                  sum_boundary += base_pixels.data[qoff + ch];
                }

                sum_vpq += this.src_pixels.data[p + ch] - this.src_pixels.data[q[i] + ch];

              }

              var new_value = (sum_fq + sum_vpq + sum_boundary) / num_neighbors;
              dx += Math.abs(new_value - this.result_pixels.data[poff + ch]);
              absx += Math.abs(new_value);
              this.result_pixels.data[poff + ch] = new_value;
            }
          }
        }
      }

      var change = dx / absx;

      if(base - change === 0) {
        break; // it has finished, return
      } else {
        base = change;
        this.result_ctx.putImageData(this.result_pixels, 0, 0);
      }

    } while(true);
    // repeat until we are done

    this.result_ctx.putImageData(this.result_pixels, 0, 0);
  }

  static get properties() { return {
    // This is the data from the store.
    _quantity: { type: Number },
    _error: { type: String },
    baseimg: { type: String, value: ""},
    srcimg: { type: String, value: ""},
    drawing: { type: Boolean, value: false},
    mask_canvas_offset: { type: JsonType},
    old_point: { type: JsonType},
    old_mpoint: { type: JsonType},
    base_size: { type: JsonType},
    blend_position_offset: { JsonType},
  }}

  _checkoutButtonClicked() {
    store.dispatch(checkout());
  }

  // This is called every time something is updated in the store.
  stateChanged(state) {
    this._quantity = cartQuantitySelector(state);
    this._error = state.shop.error;
  }

  loadSourceFile(file) {

      if(file.type.match('image/(jpeg|png)')) {
        var file_reader = new FileReader();

        file_reader.onload = ((img_file) => {
          return (e) => {
            this.srcimg = e.target.result;
          };
        })(file);
        file_reader.readAsDataURL(file);

      } else {
        alert("Please select JPEG/PNG image file.");
      }


    }

  loadBaseFile(file) {

    if(file.type.match('image/(jpeg|png)')) {
      var file_reader = new FileReader();

      file_reader.onload = ((img_file) => {
        return (e) => {
          this.baseimg = e.target.result;
        };


      })(file);
      file_reader.readAsDataURL(file);

    } else {
      alert("Please select JPEG/PNG image file.");
    }
  }
}

window.customElements.define('my-view4', MyView4);
