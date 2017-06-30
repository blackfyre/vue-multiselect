'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  data: function data() {
    return {
      search: '',
      isOpen: false,
      value: this.selected || this.selected === 0 ? (0, _utils2.default)(this.selected) : this.multiple ? [] : null
    };
  },

  props: {
    localSearch: {
      type: Boolean,
      default: true
    },

    options: {
      type: Array,
      required: true
    },

    multiple: {
      type: Boolean,
      default: false
    },

    selected: {},

    key: {
      type: String,
      default: false
    },

    label: {
      type: String,
      default: false
    },

    searchable: {
      type: Boolean,
      default: true
    },

    clearOnSelect: {
      type: Boolean,
      default: true
    },

    hideSelected: {
      type: Boolean,
      default: false
    },

    placeholder: {
      type: String,
      default: 'Select option'
    },

    maxHeight: {
      type: Number,
      default: 300
    },

    allowEmpty: {
      type: Boolean,
      default: true
    },

    resetAfter: {
      type: Boolean,
      default: false
    },

    closeOnSelect: {
      type: Boolean,
      default: true
    },

    customLabel: {
      type: Function,
      default: function _default(option, label) {
        return label ? option[label] : option;
      }
    },

    taggable: {
      type: Boolean,
      default: false
    },

    tagPlaceholder: {
      type: String,
      default: 'Press enter to create a tag'
    },

    max: {
      type: Number,
      default: 0
    },

    id: {
      default: null
    },

    optionsLimit: {
      type: Number,
      default: 1000
    }
  },
  created: function created() {
    if (this.searchable) this.adjustSearch();
  },

  computed: {
    filteredOptions: function filteredOptions() {
      var search = this.search || '';
      var options = this.hideSelected ? this.options.filter(this.isNotSelected) : this.options;
      if (this.localSearch) options = this.$options.filters.filterBy(options, this.search);
      if (this.taggable && search.length && !this.isExistingOption(search)) {
        options.unshift({ isTag: true, label: search });
      }
      return options.slice(0, this.optionsLimit);
    },
    valueKeys: function valueKeys() {
      var _this = this;

      if (this.key) {
        return this.multiple ? this.value.map(function (element) {
          return element[_this.key];
        }) : this.value[this.key];
      } else {
        return this.value;
      }
    },
    optionKeys: function optionKeys() {
      var _this2 = this;

      return this.label ? this.options.map(function (element) {
        return element[_this2.label];
      }) : this.options;
    },
    currentOptionLabel: function currentOptionLabel() {
      return this.getOptionLabel(this.value);
    }
  },
  watch: {
    'value': function value() {
      if (this.resetAfter) {
        this.$set('value', null);
        this.$set('search', null);
        this.$set('selected', null);
      }
      this.adjustSearch();
    },
    'search': function search() {
      if (this.search === this.currentOptionLabel) return;

      this.$emit('search-change', this.search, this.id);
    },
    'selected': function selected() {
      this.value = (0, _utils2.default)(this.selected);
    }
  },
  methods: {
    isExistingOption: function isExistingOption(query) {
      return !this.options ? false : this.optionKeys.indexOf(query) > -1;
    },
    isSelected: function isSelected(option) {
      if (!this.value && this.value !== 0) return false;
      var opt = this.key ? option[this.key] : option;

      if (this.multiple) {
        return this.valueKeys.indexOf(opt) > -1;
      } else {
        return this.valueKeys === opt;
      }
    },
    isNotSelected: function isNotSelected(option) {
      return !this.isSelected(option);
    },
    getOptionLabel: function getOptionLabel(option) {
      if (!option && option !== 0) return '';
      if (option.isTag) return option.label;
      return this.customLabel(option, this.label) + '';
    },
    select: function select(option) {
      if (this.max !== 0 && this.multiple && this.value.length === this.max) return;
      if (option.isTag) {
        this.$emit('tag', option.label, this.id);
        this.search = '';
      } else {
        if (this.multiple) {
          if (this.isSelected(option)) {
            this.removeElement(option);
            return;
          } else {
            this.value.push(option);
          }
        } else {
          var isSelected = this.isSelected(option);

          if (isSelected && !this.allowEmpty) {
            this.deactivate();
            return;
          }

          this.value = isSelected ? null : option;
        }
        this.$emit('select', (0, _utils2.default)(option), this.id);
        this.$emit('update', (0, _utils2.default)(this.value), this.id);

        if (this.closeOnSelect) this.deactivate();
      }
    },
    removeElement: function removeElement(option) {
      if (!this.allowEmpty && this.value.length <= 1) return;

      if (this.multiple && (typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object') {
        var index = this.valueKeys.indexOf(option[this.key]);
        this.value.splice(index, 1);
      } else {
        this.value.$remove(option);
      }
      this.$emit('remove', (0, _utils2.default)(option), this.id);
      this.$emit('update', (0, _utils2.default)(this.value), this.id);
    },
    removeLastElement: function removeLastElement() {
      if (this.search.length === 0 && Array.isArray(this.value)) {
        this.removeElement(this.value[this.value.length - 1]);
      }
    },
    activate: function activate() {
      if (this.isOpen) return;

      this.isOpen = true;

      if (this.searchable) {
        this.search = '';
        this.$els.search.focus();
      } else {
        this.$el.focus();
      }
      this.$emit('open', this.id);
    },
    deactivate: function deactivate() {
      if (!this.isOpen) return;

      this.isOpen = false;

      if (this.searchable) {
        this.$els.search.blur();
        this.adjustSearch();
      } else {
        this.$el.blur();
      }
      this.$emit('close', (0, _utils2.default)(this.value), this.id);
    },
    adjustSearch: function adjustSearch() {
      var _this3 = this;

      if (!this.searchable || !this.clearOnSelect) return;

      this.$nextTick(function () {
        _this3.search = _this3.multiple ? '' : _this3.currentOptionLabel;
      });
    },
    toggle: function toggle() {
      this.isOpen ? this.deactivate() : this.activate();
    }
  }
};