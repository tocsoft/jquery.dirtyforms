(function ($) {

    $.fn.dirtyForms = function (options) {

        //lets configure stuff
        //what we do is attach the options object to the elements directly targeting the selector

        this.$ = new dirtyForms(this);
        if (options) {
            this.data("dirtyForms.options", options);
            this.$.track();
        }


        return this;
    }

    $.dirtyForms = {
        valueFields: "input[type=text], input[type=date], input[type=email], input[type=number], select, textarea",
        checkedFields: "input[type=checkbox], input[type=radio]",
        submitFields: "input[type=submit], button[type=submit], .df-ignore",
        message  : "You have unsaved changes, make you you save your changes befores navigating away."
    };

    $('form').dirtyForms().$.isDirty();

    var oldUnload = window.onbeforeunload;

    window.onbeforeunload = function () {

        //dirty form is applied to all elements or plugin take control and try and manage part of the dom!

        //lets find all tracked fields
        
        var root = $('[data-dirtyForms-options]');

        if (root.length == 0) {
            root = $(document);
        }

        var formMessage = null
        var isDirty = false;
        root.each(function () {
            var df = $(this).dirtyForms().$;
            if (df.isDirty()) {
                isDirty = true;
                formMessage = df.getMessage();
                return false;
            }
        })

        if (isDirty) {
            return formMessage;
        } else {
            if (oldUnload) {
                return oldUnload();
            }
        }
    }

    function dirtyForms(elements) {
        var self = this;
        self.elements = elements;

        self.getOptions = function () {
            var final = $.extend({}, $.dirtyForms);
            self.elements.each(function () {
                var $this = $(this)
                $this
                    .parents('[data-dirtyForms-options]')
                    .each(function () {
                        var opts = $(this).data('dirtyForms.options')
                        if (opts) {
                            final = $.extend(final, opts);
                        }
                    });
                if ($this.is('[data-dirtyForms-options]')) {
                    var opts = self.elements.data('dirtyForms.options')
                    if (opts) {
                        final = $.extend(final, opts);
                    }
                }
            });
               

            return final;
        };
        self.getMessage = function () {
            
            var options = self.getOptions();
            return options.message;

        };

        //lets now track
        function getFields() {
            var options = self.getOptions();

            var filter = options.valueFields + " , " + options.checkedFields;
            var fields = []
            self.elements.each(function () {
                var elm = $(this);
                if (elm.is(filter)) {
                    fields.push(elm);
                }
            });

            self.elements.find(filter).each(function () {
                fields.push($(this));
            });

            return fields;
        }
        function getTrackedFields() {
            var tracked = [];
            var fields = getFields();
            for (var i in fields) {
                if (fields[i].data("dirtyFields.tracked")) {
                    tracked.push(fields[i]);
                }
            }

            return tracked;
        }

        function getStateValue(field) {

            if(field.is( $.dirtyForms.checkedFields )){
                return field.prop('checked');
            }else{
                return field.val();
            }
        }

        this.track = function (asDirty) {


            var fields = getFields();

            var addedTracker = self.elements.is("[data-dirtyForms-options]");
            
            for (var i in fields) {
                var f = fields[i];

                if (!f.data("dirtyFields.tracked")) {
                    if (!addedTracker) {
                        self.elements.attr('data-dirtyForms-options', true);
                        addedTracker = true;
                    }

                    //not already tracked
                    var f = fields[i];
                    f.data("dirtyFields.tracked", true);

                    var val = getStateValue(f);
                    f.data("dirtyFields.value", val);
                }
            }
            if (asDirty) {
                this.markDirty();
            }
        }

        this.markDirty = function () {
            var fields = getTrackedFields();

            for (var i in fields) {
                var f = fields[i];
                f.data("dirtyFields.isDirty", true);
            }
        }

        this.markClean = function () {
            var fields = getTrackedFields();
            for (var i in fields) {
                var f = fields[i];
                var val = getStateValue(f);
                f.data("dirtyFields.value", val);
                f.data("dirtyFields.isDirty", false);
            }
        }


        this.isDirty = function () {
            var fields = getTrackedFields();
            for (var i in fields) {
                var f = fields[i];
                if (f.data("dirtyFields.isDirty")) {
                    return true;
                }
                else {
                    var currentVal = getStateValue(f);
                    var oldVal = f.data("dirtyFields.value");

                    if (currentVal !== oldVal) {
                        return true;
                    }
                }
            }

            return false;
        }
    }


    $(function () {
        $('[data-dirtyforms=track]').dirtyForms().$.track();
    });
})(jQuery);
