/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2018 Bentley Systems, Incorporated. All rights reserved. $
*--------------------------------------------------------------------------------------------*/

import { assert, expect } from "chai";
import Schema from "../../source/Metadata/Schema";
import { ECObjectsError } from "../../source/Exception";
import KindOfQuantity from "../../source/Metadata/KindOfQuantity";
import * as sinon from "sinon";

describe("KindOfQuantity", () => {
  describe("deserialization", () => {
    it("fully defined", async () => {
      const testSchema = {
        $schema: "https://dev.bentley.com/json_schemas/ec/31/draft-01/ecschema",
        name: "TestSchema",
        version: "1.2.3",
        items: {
          testKoQ: {
            schemaItemType: "KindOfQuantity",
            precision: 5,
            persistenceUnit: {
              format: "DefaultReal",
              unit: "MM",
            },
            presentationUnits: [
              {
                format: "DefaultReal",
                unit: "CM",
              },
              {
                format: "DefaultReal",
                unit: "IN",
              },
            ],
          },
        },
      };

      const ecSchema = await Schema.fromJson(testSchema);
      // const format  = await testSchema.$schema<schema>.getItem("format");
      // assert.isDefined(format);
      assert.isDefined(ecSchema);

      const testItem = await ecSchema.getItem("testKoQ");
      assert.isDefined(testItem);
      assert.isTrue(testItem instanceof KindOfQuantity);

      const testKoQ: KindOfQuantity = testItem as KindOfQuantity;
      assert.isDefined(testKoQ);

      expect(testKoQ.precision).equal(5);
      assert.isDefined(testKoQ.persistenceUnit);

      const persistenceUnit = testKoQ.persistenceUnit;
      expect(persistenceUnit!.format).equal("DefaultReal");

      expect(testKoQ.presentationUnits.length).equal(2);

      assert.isTrue(testKoQ.presentationUnits[0] === testKoQ.defaultPresentationUnit);
    });
  });

  describe("fromJson", () => {
    let testKoQ: KindOfQuantity;
    const baseJson = { schemaItemType: "KindOfQuantity" };

    beforeEach(() => {
      const schema = new Schema("TestSchema", 1, 0, 0);
      testKoQ = new KindOfQuantity(schema, "TestKindOfQuantity");
    });

    it("should successfully deserialize valid JSON", async () => {
      const koqJson = {
        ...baseJson,
        label: "SomeDisplayLabel",
        description: "A really long description...",
        precision: 1.234,
        persistenceUnit: { unit: "in", format: "DEFAULTREAL" },
        presentationUnits: [
          { unit: "cm" },
          { unit: "in", format: "anotherFormat" },
        ],
      };
      await testKoQ.fromJson(koqJson);

      expect(testKoQ.name).to.eql("TestKindOfQuantity");
      expect(testKoQ.label).to.eql("SomeDisplayLabel");
      expect(testKoQ.description).to.eql("A really long description...");
      expect(testKoQ.precision).to.eql(1.234);
      expect(testKoQ.presentationUnits).to.exist;
      expect(testKoQ.presentationUnits.length).to.eql(2);
      expect(testKoQ.defaultPresentationUnit).to.eql({ unit: "cm" });
      expect(testKoQ.presentationUnits[0]).to.eql({ unit: "cm" });
      expect(testKoQ.presentationUnits[1]).to.eql({ unit: "in", format: "anotherFormat" });
      expect(testKoQ.persistenceUnit).to.eql({ unit: "in", format: "DEFAULTREAL" });
    });

    it("should successfully deserialize valid JSON (without units)", async () => {
      const koqJson = {
        ...baseJson,
        label: "SomeDisplayLabel",
        description: "A really long description...",
        precision: 1.234,
      };
      await testKoQ.fromJson(koqJson);

      expect(testKoQ.name).to.eql("TestKindOfQuantity");
      expect(testKoQ.label).to.eql("SomeDisplayLabel");
      expect(testKoQ.description).to.eql("A really long description...");
      expect(testKoQ.precision).to.eql(1.234);
      expect(testKoQ.presentationUnits).to.exist;
      expect(testKoQ.presentationUnits.length).to.eql(0);
      expect(testKoQ.defaultPresentationUnit).to.not.exist;
      expect(testKoQ.persistenceUnit).to.not.exist;
    });
    async function testInvalidAttribute(attributeName: string, expectedType: string, value: any) {
      expect(testKoQ).to.exist;
      const json: any = {
        ...baseJson,
        [attributeName]: value,
      };
      await expect(testKoQ.fromJson(json)).to.be.rejectedWith(ECObjectsError, `The KindOfQuantity TestKindOfQuantity has an invalid '${attributeName}' attribute. It should be of type '${expectedType}'.`);
    }

    it("should throw for invalid precision", async () => testInvalidAttribute("precision", "number", false));
    it("should throw for presentationUnits not an array", async () => testInvalidAttribute("presentationUnits", "object[]", 0));
    it("should throw for presentationUnits not an array of objects", async () => testInvalidAttribute("presentationUnits", "object[]", [0]));

    it("should throw for presentationUnit with missing unit", async () => {
      expect(testKoQ).to.exist;
      const json: any = {
        ...baseJson,
        presentationUnits: [{}],
      };
      await expect(testKoQ.fromJson(json)).to.be.rejectedWith(ECObjectsError, `The KindOfQuantity TestKindOfQuantity has a presentationUnit that is missing the required attribute 'unit'.`);
    });

    it("should throw for presentationUnit with invalid unit", async () => {
      expect(testKoQ).to.exist;
      const json: any = {
        ...baseJson,
        presentationUnits: [{ unit: 0 }],
      };
      await expect(testKoQ.fromJson(json)).to.be.rejectedWith(ECObjectsError, `The KindOfQuantity TestKindOfQuantity has a presentationUnit with an invalid 'unit' attribute. It should be of type 'string'.`);
    });

    it("should throw for presentationUnit with invalid format", async () => {
      expect(testKoQ).to.exist;
      const json: any = {
        ...baseJson,
        presentationUnits: [{ unit: "valid", format: false }],
      };
      await expect(testKoQ.fromJson(json)).to.be.rejectedWith(ECObjectsError, `The KindOfQuantity TestKindOfQuantity has a presentationUnit with an invalid 'format' attribute. It should be of type 'string'.`);
    });

    it("should throw for persistenceUnit not an object", async () => testInvalidAttribute("persistenceUnit", "object", 0));

    it("should throw for persistenceUnit with missing unit", async () => {
      expect(testKoQ).to.exist;
      const json: any = {
        ...baseJson,
        persistenceUnit: {},
      };
      await expect(testKoQ.fromJson(json)).to.be.rejectedWith(ECObjectsError, `The KindOfQuantity TestKindOfQuantity has a persistenceUnit that is missing the required attribute 'unit'.`);
    });

    it("should throw for persistenceUnit with invalid unit", async () => {
      expect(testKoQ).to.exist;
      const json: any = {
        ...baseJson,
        persistenceUnit: { unit: 0 },
      };
      await expect(testKoQ.fromJson(json)).to.be.rejectedWith(ECObjectsError, `The KindOfQuantity TestKindOfQuantity has a persistenceUnit with an invalid 'unit' attribute. It should be of type 'string'.`);
    });

    it("should throw for persistenceUnit with invalid format", async () => {
      expect(testKoQ).to.exist;
      const json: any = {
        ...baseJson,
        persistenceUnit: { unit: "valid", format: false },
      };
      await expect(testKoQ.fromJson(json)).to.be.rejectedWith(ECObjectsError, `The KindOfQuantity TestKindOfQuantity has a persistenceUnit with an invalid 'format' attribute. It should be of type 'string'.`);
    });
  });

  describe("accept", () => {
    let testKoq: KindOfQuantity;

    beforeEach(() => {
      const schema = new Schema("TestSchema", 1, 0, 0);
      testKoq = new KindOfQuantity(schema, "TestKindOfQuantity");
    });

    it("should call visitKindOfQuantity on a SchemaItemVisitor object", async () => {
      expect(testKoq).to.exist;
      const mockVisitor = { visitKindOfQuantity: sinon.spy() };
      await testKoq.accept(mockVisitor);
      expect(mockVisitor.visitKindOfQuantity.calledOnce).to.be.true;
      expect(mockVisitor.visitKindOfQuantity.calledWithExactly(testKoq)).to.be.true;
    });

    it("should safely handle a SchemaItemVisitor without visitKindOfQuantity defined", async () => {
      expect(testKoq).to.exist;
      await testKoq.accept({});
    });
  });
});
