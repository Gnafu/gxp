/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = gxp
 *  class = PointSymbolizer
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class:: PointSymbolizer(config)
 *   
 *      Form for configuring a point symbolizer.
 */
gxp.PointSymbolizer = Ext.extend(Ext.Panel, {

    /** api: config[symbolizer]
     *  ``Object``
     *  A symbolizer object that will be used to fill in form values.
     *  This object will be modified when values change.  Clone first if
     *  you do not want your symbolizer modified.
     */
    symbolizer: null,

    /** api: config[alternateSymbolizers]
     *  ``Array`` Additional symbolizer(s) that should be updated.
     */
    alternateSymbolizers: null,
    
    /** i18n */
    graphicCircleText: "circle",
    graphicSquareText: "square",
    graphicTriangleText: "triangle",
    graphicStarText: "star",
    graphicCrossText: "cross",
    graphicXText: "x",
    graphicExternalText: "external",
    urlText: "URL",
    opacityText: "opacity",
    symbolText: "Symbol",
    sizeText: "Size",
    rotationText: "Rotation",
    
    /** api: config[pointGraphics]
     *  ``Array``
     *  A list of objects to be used as the root of the data for a
     *  JsonStore.  These will become records used in the selection of
     *  a point graphic.  If an object in the list has no "value" property,
     *  the user will be presented with an input to provide their own URL
     *  for an external graphic.  By default, names of well-known marks are
     *  provided.  In addition, the default list will produce a record with
     *  display of "external" that create an input for an external graphic
     *  URL.
     *
     * Fields:
     *
     *  * display - ``String`` The name to be displayed to the user.
     *  * preview - ``String`` URL to a graphic for preview.
     *  * value - ``String`` Value to be sent to the server.
     *  * mark - ``Boolean`` The value is a well-known name for a mark.  If
     *      ``false``, the value will be assumed to be a url for an external graphic.
     */
    pointGraphics: null,
    
   /** api: config[colorManager]
     *  ``Function``
     *  Optional color manager constructor to be used as a plugin for the color
     *  field.
     */
    colorManager: null,
    
    /** private: property[external]
     *  ``Boolean``
     *  Currently using an external graphic.
     */
    external: null,
    
    /** private: config[layout]
     *  ``String``
     */
    layout: "form",

    /** private: method[updateSymbolizer]
     *  Update the main symbolizer and any alternate symbolizers.
     */
    updateSymbolizer: function(field, value) {
        this.symbolizer[field] = value;
        if (this.alternateSymbolizers) {
            for (var i=0, ii=this.alternateSymbolizers.length; i<ii; ++i) {
                this.alternateSymbolizers[i][field] = value;
            }
        }
    },

    initComponent: function() {
        
        if(!this.symbolizer) {
            this.symbolizer = {};
        }   
        
        if (!this.pointGraphics) {
            this.pointGraphics = [
                {display: this.graphicCircleText, value: "circle", mark: true},
                {display: this.graphicSquareText, value: "square", mark: true},
                {display: this.graphicTriangleText, value: "triangle", mark: true},
                {display: this.graphicStarText, value: "star", mark: true},
                {display: this.graphicCrossText, value: "cross", mark: true},
                {display: this.graphicXText, value: "x", mark: true},
                {display: this.graphicExternalText}
            ];
        }
        
        this.external = !!this.symbolizer["externalGraphic"];

        this.urlField = new Ext.form.TextField({
            name: "url",
            fieldLabel: this.urlText,
            value: this.symbolizer["externalGraphic"],
            hidden: true,
            listeners: {
                change: function(field, value) {
                    this.updateSymbolizer("externalGraphic", value);
                    this.fireEvent("change", this.symbolizer);
                },
                scope: this
            },
            width: 100 // TODO: push this to css
        });
        
        this.items = [{
            xtype: "combo",
            name: "mark",
            fieldLabel: this.symbolText,
            store: new Ext.data.JsonStore({
                data: {root: this.pointGraphics},
                root: "root",
                fields: ["value", "display", "preview", {name: "mark", type: "boolean"}]
            }),
            value: this.external ? 0 : this.symbolizer["graphicName"],
            displayField: "display",
            valueField: "value",
            tpl: new Ext.XTemplate(
                '<tpl for=".">' +
                    '<div class="x-combo-list-item gx-pointsymbolizer-mark-item">' +
                    '<tpl if="preview">' +
                        '<img src="{preview}" alt="{display}"/>' +
                    '</tpl>' +
                    '<span>{display}</span>' +
                '</div></tpl>'
            ),
            mode: "local",
            allowBlank: false,
            triggerAction: "all",
            editable: false,
            listeners: {
                select: function(combo, record) {
                    var mark = record.get("mark");
                    var value = record.get("value");
                    if(!mark) {
                        if(value) {
                            this.urlField.hide();
                            // this to hide the container - otherwise the label remains
                            this.urlField.getEl().up('.x-form-item').setDisplayed(false);
                            this.updateSymbolizer("externalGraphic", value);
                        } else {
                            this.urlField.show();
                            this.urlField.getEl().up('.x-form-item').setDisplayed(true);
                        }
                        if(!this.external) {
                            this.external = true;
                        }
                    } else {
                        if(this.external) {
                            this.external = false;
                            this.updateSymbolizer("externalGraphic", undefined);
                        }
                        this.updateSymbolizer("graphicName", value);
                    }
                    this.fireEvent("change", this.symbolizer);
                },
                scope: this
            },
            width: 100 // TODO: push this to css
        }, {
            xtype: "textfield",
            name: "size",
            fieldLabel: this.sizeText,
            value: this.symbolizer["pointRadius"] && this.symbolizer["pointRadius"] * 2,
            listeners: {
                change: function(field, value) {
                    this.updateSymbolizer("pointRadius", value / 2);
                    this.fireEvent("change", this.symbolizer);
                },
                scope: this
            },
            width: 100 // TODO: push this to css
        }, {
            xtype: "textfield",
            name: "rotation",
            fieldLabel: this.rotationText,
            value: this.symbolizer["rotation"],
            listeners: {
                change: function(field, value) {
                    this.updateSymbolizer("rotation", value);
                    this.fireEvent("change", this.symbolizer);
                },
                scope: this
            },
            width: 100 // TODO: push this to css
        }, this.urlField
        ];

        this.addEvents(
            /**
             * Event: change
             * Fires before any field blurs if the field value has changed.
             *
             * Listener arguments:
             * symbolizer - {Object} A symbolizer with stroke related properties
             *     updated.
             */
            "change"
        ); 

        gxp.PointSymbolizer.superclass.initComponent.call(this);

    }
    
    
});

/** api: xtype = gxp_pointsymbolizer */
Ext.reg('gxp_pointsymbolizer', gxp.PointSymbolizer);
