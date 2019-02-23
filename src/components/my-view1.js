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

// These are the shared styles needed by this element.
import { SharedStyles } from './shared-styles.js';

class MyView1 extends PageViewElement {
  render() {
    return html`
      ${SharedStyles}
      <section>
        <h2>Mixing and Blending with Poisson</h2>
        <p>The Poisson Image Editing process has been studied many times in different papers. Operations like seamless cloning by manipulating image gradients are commonly used in social media for entertainment purposes. This project attempts to reproduce the paper on Poisson Image Editing by Patrick Perez, Michel Gangnet, and Andrew Blake. It is always exciting to create something out of nothing by playing with math. You can say, it has always put a smile on our faces.</p>
                <p>Please enter the Live Demo section and start playing with your own images!</p>
      </section>
      <section>
        <h2>Caveats and Assumptions</h2>
        <p>This project is to demonstrate the Poisson Image Editing Algorithm as presented in the above-mentioned paper. It uses a default 400 x 300 pixels image and it is not tested for edge cases. </p>
      </section>      
    `;
  }
}

window.customElements.define('my-view1', MyView1);
