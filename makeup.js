var makeup = (function __makeup__ () {
    var request = (function makeup$__request__ () {
            
            // fork XHR
            var newXHR;
            if ("XMLHttpRequest" in window) {
                newXHR = function newXHR () {
                    return new XMLHttpRequest();
                };
            } else if ("ActiveXObject" in window) {
                newXHR = function newXHR () {
                    new ActiveXObject("Msxml2.XMLHTTP.3.0");
                };
            }
            return function makeup$request (url, callback) {
                var XHR = newXHR();
                XHR.open("GET", url, true);
                XHR.onload = function makeup$request$onloadCallback () {
                    callback(XHR.responseXML);    // not responseText
                };
                XHR.send();
            };
        }()),

        processor = null,
        
        // Store the XSL file
        stylessheet = null,
        
        // Store callbacks until template is ready
        listeners = [],
        ready = false,

        // Constructor
        Makeup = function Makeup (xml, callback) {
            var that = this;
            request(xml, function Makeup$request (responseXML) {
                
                // Fuse the data and templates only if template file is ready,
                //     otherwise, add this to the waiting list
                if (ready) {
                    that.fuse(responseXML, callback);
                } else {
                    listeners.push(function () {
                        that.fuse(responseXML, callback);
                    });
                }
            });
        };
    Makeup.prototype.fuse = function Makeup$fuse (XMLData, callback) {
        var fragment = document.createDocumentFragment();
        if (document.implementation && document.implementation.createDocument) {
            processor = new XSLTProcessor()
            resultDocument = processor.transformToFragment(XMLData, document);
            fragment = resultDocument;    // DOM Element
        } else {
            fragment.innerHTML = XMLData.transformNode(this.xsl);
        }
        if (typeof callback === "function") {
            callback(fragment);
        }
    };
    return {
        load: function makeup$load (xsl, callback) {
            var that = this;
            request(xsl, function Makeup$loadCallback (responseXML) {
                
                // Fire all the event on hold
                if (!ready) {
                    ready = true;
                    listeners.forEach(function (item) {
                        item();
                    });
                }
                stylessheet = responseXML;
                if (processor !== null) {
                    processor.importStylesheet(responseXML);
                }
                if (typeof callback === "function") {
                    callback.call(that);
                }
            });
        },
        fuse: function makeup$fuse (xml, callback) {
            new Makeup(xml, callback);
        }
    };
}());