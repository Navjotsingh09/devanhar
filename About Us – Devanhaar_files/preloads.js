
    (function() {
      var cdnOrigin = "https://cdn.shopify.com";
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.DVCYsNc5.js","/cdn/shopifycloud/checkout-web/assets/c1/app.BdYQjaqU.js","/cdn/shopifycloud/checkout-web/assets/c1/vendor.DRXWjiS4.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.GXhEXWG8.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage.BnUCcheU.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentButtons.tYin9XZU.js","/cdn/shopifycloud/checkout-web/assets/c1/LocalPickup.DiygiD9o.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName.BCvlkjHe.js","/cdn/shopifycloud/checkout-web/assets/c1/VaultedPayment.B4qgWYlf.js","/cdn/shopifycloud/checkout-web/assets/c1/MarketsProDisclaimer.Brsza9LV.js","/cdn/shopifycloud/checkout-web/assets/c1/AddDiscountButton.pTLwogg6.js","/cdn/shopifycloud/checkout-web/assets/c1/RememberMeDescriptionText.BeQwdCc8.js","/cdn/shopifycloud/checkout-web/assets/c1/ShopPayOptInDisclaimer.Pf4jIvkt.js","/cdn/shopifycloud/checkout-web/assets/c1/MobileOrderSummary.DDvaf22U.js","/cdn/shopifycloud/checkout-web/assets/c1/PayButtonSection.Dj0ddVnT.js","/cdn/shopifycloud/checkout-web/assets/c1/SeparatePaymentsNotice.DL1A4zTM.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentOptions.Zxf0oVVE.js","/cdn/shopifycloud/checkout-web/assets/c1/usePreselectSpi.DRb8VTcF.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblemsLineItemList.t-9yPuVH.js","/cdn/shopifycloud/checkout-web/assets/c1/component-ShopPayVerificationSwitch.DtDYxatF.js","/cdn/shopifycloud/checkout-web/assets/c1/useSubscribeMessenger.DuLoYkMu.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-js-index.akl8OGK0.js","/cdn/shopifycloud/checkout-web/assets/c1/v4.BKrj-4V8.js","/cdn/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown.0uyxFJRt.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandiseModal.DjKOUCJR.js","/cdn/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview.OTzYb0O-.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.eBeeUUVi.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.DYH7B_vD.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/LocalPickup.Br8sZ79N.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/AddDiscountButton.Ca9titpM.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MobileOrderSummary.DjnS_Dr1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentOptions.PpwvcyQt.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShopPayVerificationSwitch.WW3cs_z5.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/VaultedPayment.OxMVm7u-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = [];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [cdnOrigin].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  