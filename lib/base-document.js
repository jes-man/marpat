'use strict';

const _ = require('lodash');
const { Client } = require('./clients');
const {
  isValidType,
  isEmptyValue,
  isInChoices,
  isArray,
  isDocument,
  isEmbeddedDocument,
  isString,
  isNumber,
  isDate
} = require('./validate');
const { ValidationError } = require('./errors');

const normalizeType = function(property) {
  let typeDeclaration = {};
  if (property.type) {
    typeDeclaration = property;
  } else {
    typeDeclaration.type = property;
  }

  return typeDeclaration;
};

class BaseDocument {
  constructor() {
    this._schema = {
      // Defines document structure/properties
      _id: { type: Client().nativeIdType() } // Native ID to backend database
    };

    this._id = null;
  }

  // TODO: Is there a way to tell if a class is
  // a subclass of something? Until I find out
  // how, we'll be lazy use this.
  static documentClass() {
    throw new TypeError('You must override documentClass (static).');
  }

  documentClass() {
    throw new TypeError('You must override documentClass.');
  }

  collectionName() {
    return this.constructor.collectionName();
  }

  /**
   * Get current collection name
   *
   * @returns {String}
   */
  static collectionName() {
    return this.name.toLowerCase() + 's';
  }

  /**
   * set schema
   * @param {Object} extension
   */
  schema(extension) {
    const that = this;
    _.keys(extension).forEach(function(k) {
      that[k] = extension[k];
    });
  }

  /*
     * Pre/post Hooks
     *
     * To add a hook, the extending class just needs
     * to override the appropriate hook method below.
     */
  /**
   * preInit will fire before an instance is initialized for the first time. This is useful to automatically create
   * @param  {Object} instance The data used when creating an document.
   *
   */
  preInit(instance) {}

  preValidate() {}

  postValidate() {}

  preSave() {}

  postSave() {}

  preDelete() {}

  postDelete() {}

  postFind() {}

  /**
   * Generate this._schema from fields
   *
   * TODO : EMBEDDED
   * Need to share this with embedded
   */
  generateSchema() {
    const that = this;

    _.keys(this).forEach(function(k) {
      // Ignore private variables
      if (_.startsWith(k, '_')) {
        return;
      }

      // Normalize the type format
      that._schema[k] = normalizeType(that[k]);

      // Assign a default if needed
      if (isArray(that._schema[k].type)) {
        that[k] = that.getDefault(k) || [];
      } else {
        that[k] = that.getDefault(k);
      }
    });
  }

  /**
   * Validate current document
   *
   * The method throw errors if document has invalid value
   *
   * TODO: This is not the right approach. The method needs to collect all
   * errors in array and return them.
   */
  validate() {
    const that = this;

    _.keys(that._schema).forEach(function(key) {
      let value = that[key];
      // TODO: This should probably be in Document, not BaseDocument
      if (value !== null && value !== undefined) {
        if (isEmbeddedDocument(value)) {
          value.validate();
          return;
        } else if (
          isArray(value) &&
          value.length > 0 &&
          isEmbeddedDocument(value[0])
        ) {
          value.forEach(function(v) {
            v.validate();
          });
          return;
        }
      }

      if (!isValidType(value, that._schema[key].type)) {
        // TODO: Formatting should probably be done somewhere else
        let typeName = null;
        let valueName = null;
        if (
          Array.isArray(that._schema[key].type) &&
          that._schema[key].type.length > 0
        ) {
          typeName = '[' + that._schema[key].type[0].name + ']';
        } else if (
          Array.isArray(that._schema[key].type) &&
          that._schema[key].type.length === 0
        ) {
          typeName = '[]';
        } else {
          typeName = that._schema[key].type.name;
        }

        if (Array.isArray(value)) {
          // TODO: Not descriptive enough! Strings can look like numbers
          valueName = '[' + value.toString() + ']';
        } else {
          valueName = typeof value;
        }
        throw new ValidationError(
          'Value assigned to ' +
            that.collectionName() +
            '.' +
            key +
            ' should be ' +
            typeName +
            ', got ' +
            valueName
        );
      }

      if (that._schema[key].required && isEmptyValue(value)) {
        throw new ValidationError(
          'Key ' +
            that.collectionName() +
            '.' +
            key +
            ' is required' +
            ', but got ' +
            value
        );
      }

      if (
        that._schema[key].match &&
        isString(value) &&
        !that._schema[key].match.test(value)
      ) {
        throw new ValidationError(
          'Value assigned to ' +
            that.collectionName() +
            '.' +
            key +
            ' does not match the regex/string ' +
            that._schema[key].match.toString() +
            '. Value was ' +
            value
        );
      }

      if (!isInChoices(that._schema[key].choices, value)) {
        throw new ValidationError(
          'Value assigned to ' +
            that.collectionName() +
            '.' +
            key +
            ' should be in choices [' +
            that._schema[key].choices.join(', ') +
            '], got ' +
            value
        );
      }

      if (isNumber(that._schema[key].min) && value < that._schema[key].min) {
        throw new ValidationError(
          'Value assigned to ' +
            that.collectionName() +
            '.' +
            key +
            ' is less than min, ' +
            that._schema[key].min +
            ', got ' +
            value
        );
      }

      if (isNumber(that._schema[key].max) && value > that._schema[key].max) {
        throw new ValidationError(
          'Value assigned to ' +
            that.collectionName() +
            '.' +
            key +
            ' is less than max, ' +
            that._schema[key].max +
            ', got ' +
            value
        );
      }

      if (
        typeof that._schema[key].validate === 'function' &&
        !that._schema[key].validate(value)
      ) {
        throw new ValidationError(
          'Value assigned to ' +
            that.collectionName() +
            '.' +
            key +
            ' failed custom validator. Value was ' +
            value
        );
      }
    });
  }

  /*
     * Right now this only canonicalizes dates (integer timestamps
     * get converted to Date objects), but maybe we should do the
     * same for strings (UTF, Unicode, ASCII, etc)?
     */
  canonicalize() {
    const that = this;

    _.keys(that._schema).forEach(function(key) {
      let value = that[key];

      if (that._schema[key].type === Date && isDate(value)) {
        that[key] = new Date(value);
      } else if (
        value !== null &&
        value !== undefined &&
        value.documentClass &&
        value.documentClass() === 'embedded'
      ) {
        // TODO: This should probably be in Document, not BaseDocument
        value.canonicalize();
        return;
      }
    });
  }

  /**
   * Create new document from data
   *
   * @param {Object} data
   * @returns {Document}
   */
  static create(data) {
    this.createIndexes();

    let instance =
      typeof data !== 'undefined' ? this._fromData(data) : this._instantiate();
    try {
      instance.preInit(data);
    } catch (e) {}
    return instance;
  }

  static createIndexes() {}

  /**
   * Create new document from self
   *
   * @returns {BaseDocument}
   * @private
   */
  static _instantiate() {
    let instance = new this();
    instance.generateSchema();
    return instance;
  }

  // TODO: Should probably move some of this to
  // Embedded and Document classes since Base shouldn't
  // need to know about child classes
  static _fromData(datas) {
    const that = this;

    if (!isArray(datas)) {
      datas = [datas];
    }

    let documents = [];
    let embeddedPromises = [];
    datas.forEach(function(d) {
      let instance = that._instantiate();
      _.keys(d).forEach(function(key) {
        let value = null;
        if (d[key] === null) {
          value = instance.getDefault(key);
        } else {
          value = d[key];
        }

        // If its not in the schema, we don't care about it... right?
        if (key in instance._schema) {
          let type = instance._schema[key].type;

          if (type.documentClass && type.documentClass() === 'embedded') {
            // Initialize EmbeddedDocument
            instance[key] = type._fromData(value);
          } else if (
            isArray(type) &&
            type.length > 0 &&
            type[0].documentClass &&
            type[0].documentClass() === 'embedded'
          ) {
            // Initialize array of EmbeddedDocuments
            instance[key] = [];
            value.forEach(function(v, i) {
              instance[key][i] = type[0]._fromData(v);
            });
          } else {
            // Initialize primitive or array of primitives
            instance[key] = value;
          }
        } else if (key in instance) {
          // Handles virtual setters
          instance[key] = value;
        }
      });

      documents.push(instance);
    });

    if (documents.length === 1) {
      return documents[0];
    }
    return documents;
  }

  /**
   * Populates document references
   *
   * TODO : EMBEDDED
   * @param {Array|Document} docs
   * @param {Array} fields
   * @returns {Promise}
   */
  static populate(docs, fields) {
    let documents = null;

    if (!isArray(docs)) {
      documents = [docs];
    } else if (docs.length < 1) {
      return Promise.all(docs);
    } else {
      documents = docs;
    }

    // Load all 1-level-deep references
    // First, find all unique keys needed to be loaded...
    let keys = [];

    // TODO: Bad assumption: Not all documents in the database will have the same schema...
    // Hmm, if this is true, thats an error on the user. Right?
    let anInstance = documents[0];

    _.keys(anInstance._schema).forEach(function(key) {
      if (isArray(fields) && fields.indexOf(key) < 0) {
        return;
      }

      // Handle array of references (ex: { type: [MyObject] })
      if (
        isArray(anInstance._schema[key].type) &&
        anInstance._schema[key].type.length > 0 &&
        isDocument(anInstance._schema[key].type[0])
      ) {
        keys.push(key);
      }
      // Handle anInstance[key] being a string id, a native id, or a Document instance
      else if (
        (isString(anInstance[key]) || Client().isNativeId(anInstance[key])) &&
        isDocument(anInstance._schema[key].type)
      ) {
        keys.push(key);
      }
    });

    // ...then get all ids for each type of reference to be loaded...
    // ids = {
    //      houses: {
    //          'abc123': ['ak23lj', '2kajlc', 'ckajl32'],
    //          'l2jo99': ['28dsa0']
    //      },
    //      friends: {
    //          '1039da': ['lj0adf', 'k2jha']
    //      }
    //}
    let ids = {};
    keys.forEach(function(k) {
      ids[k] = {};
      documents.forEach(function(d) {
        ids[k][Client().toCanonicalId(d._id)] = [].concat(d[k]); // Handles values and arrays

        // Also, initialize document member arrays
        // to assign to later if needed
        if (isArray(d[k])) {
          d[k] = [];
        }
      });
    });

    // TODO: Is this really the most efficient
    // way to do this? Maybe make a master list
    // of all objects that need to be loaded (separated
    // by type), load those, and then search through
    // ids to see where dereferenced objects should
    // go?

    // ...then for each array of ids, load them all...
    let loadPromises = [];
    _.keys(ids).forEach(function(key) {
      let keyIds = [];
      _.keys(ids[key]).forEach(function(k) {
        // Before adding to list, we convert id to the
        // backend database's native ID format.
        keyIds = keyIds.concat(ids[key][k]);
      });
      // Only want to load each reference once
      keyIds = _.uniq(keyIds);
      // Handle array of references (like [MyObject])
      let type = null;
      if (isArray(anInstance._schema[key].type)) {
        type = anInstance._schema[key].type[0];
      } else {
        type = anInstance._schema[key].type;
      }

      // Bulk load dereferences
      let p = type
        .find({ _id: { $in: keyIds } }, { populate: false })
        .then(function(dereferences) {
          // Assign each dereferenced object to parent

          _.keys(ids[key]).forEach(function(k) {
            // TODO: Replace with documents.find when able
            // Find the document to assign the derefs to
            let doc;
            documents.forEach(function(d) {
              if (Client().toCanonicalId(d._id) === k) doc = d;
            });

            // For all ids to be dereferenced, find the
            // deref and assign or push it
            ids[key][k].forEach(function(id) {
              // TODO: Replace with dereferences.find when able
              // Find the right dereference
              let deref;
              dereferences.forEach(function(d) {
                if (
                  Client().toCanonicalId(d._id) === Client().toCanonicalId(id)
                )
                  deref = d;
              });

              if (isArray(anInstance._schema[key].type)) {
                doc[key].push(deref);
              } else {
                doc[key] = deref;
              }
            });
          });
        });

      loadPromises.push(p);
    });

    // ...and finally execute all promises and return our
    // fully loaded documents.
    return Promise.all(loadPromises).then(function() {
      return docs;
    });
  }

  /**
   * Get default value
   *
   * @param {String} schemaProp Key of current schema
   * @returns {*}
   */
  getDefault(schemaProp) {
    if (schemaProp in this._schema && 'default' in this._schema[schemaProp]) {
      let def = this._schema[schemaProp].default;
      let defVal = typeof def === 'function' ? def() : def;
      this[schemaProp] = defVal; // TODO: Wait... should we be assigning it here?
      return defVal;
    }

    return undefined;
  }

  /**
   * For JSON.Stringify
   *
   * @returns {*}
   */
  toJSON() {
    let values = this._toData({ _id: true });
    let schema = this._schema;
    for (let key in schema) {
      if (schema[key].private) {
        delete values[key];
      } else if (values[key] && values[key].toJSON) {
        values[key] = values[key].toJSON();
      } else if (isArray(values[key])) {
        let newArray = [];
        values[key].forEach(function(i) {
          if (i && i.toJSON) {
            newArray.push(i.toJSON());
          } else {
            newArray.push(i);
          }
        });
        values[key] = newArray;
      }
    }

    return values;
  }

  /**
   *
   * @param keep
   * @returns {{}}
   * @private
   */
  _toData(keep) {
    const that = this;

    if (keep === undefined || keep === null) {
      keep = {};
    }

    let values = {};
    _.keys(this).forEach(function(k) {
      if (_.startsWith(k, '_')) {
        if (k !== '_id' || !keep._id) {
          return;
        } else {
          values[k] = that[k];
        }
      } else if (isEmbeddedDocument(that[k])) {
        values[k] = that[k]._toData();
      } else if (
        isArray(that[k]) &&
        that[k].length > 0 &&
        isEmbeddedDocument(that[k][0])
      ) {
        values[k] = [];
        that[k].forEach(function(v) {
          values[k].push(v._toData());
        });
      } else {
        values[k] = that[k];
      }
    });

    return values;
  }

  _getEmbeddeds() {
    const that = this;
    let embeddeds = [];
    _.keys(this._schema).forEach(function(v) {
      if (
        isEmbeddedDocument(that._schema[v].type) ||
        (isArray(that._schema[v].type) &&
          isEmbeddedDocument(that._schema[v].type[0]))
      ) {
        embeddeds = embeddeds.concat(that[v]);
      }
    });
    return embeddeds;
  }

  _getHookPromises(hookName) {
    let embeddeds = this._getEmbeddeds();
    let hookPromises = [];
    hookPromises = hookPromises.concat(_.invokeMap(embeddeds, hookName));
    hookPromises.push(this[hookName]());
    return hookPromises;
  }
}

module.exports = BaseDocument;
