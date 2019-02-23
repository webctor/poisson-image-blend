/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {LitElement, html, property} from '@polymer/lit-element';


class MyHeader extends LitElement {
  render() {
    return html`      
      <style>               
       
       :host {
       display: flex;
       width: 100%;
       }
       
       .container {
          width: 100%;
          margin: 0 auto;
        }
        
        .parallelogram {
            width: 50%;
            height: 100px;
            margin: 0 0 0 -20px;
            -webkit-transform: skew(20deg);
            -moz-transform: skew(20deg);
            -o-transform: skew(20deg);          
            overflow: hidden;
            position: relative;
            float:left;
        }
        
        .image {
          position: absolute;
          float:right;
          width: 100%;
          top: -30px;
          left: -30px;
          right: -30px;
          bottom: -30px;              
        }
       
        
      </style>

      <div class="container"> 
        <div class="parallelogram">
          <img id="srcimg" src="${this.imgsrc}" class="image" />
        </div>
        <!--div class="arrowright">
        =>
        </div-->
        <div class="parallelogram">
          <img id="baseimg" src="${this.imgbase}" class="image" />
        </div>      
      </div>     
    `;
  }


  firstUpdated() {
    this.imgsrc = './images/default-placeholder.png';
    this.imgbase = './images/default-placeholder.png';
  }

  static get properties() { return {
    initimg: {
      type: Boolean
    },
    imgsrc: {
      type: String
    },
    imgbase: {
      type: String
    },
  }}
}

window.customElements.define('my-header', MyHeader);
