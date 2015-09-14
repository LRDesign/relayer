import APIError from "../src/relayer/APIError.js"

class TestAPIError extends APIError {
  get awesome() {
    return this.pathGet("$.data.awesome");
  }
  get cheese() {
    return this.pathGet("$.data.cheese");
  }
}

describe("APIError", function() {
  var testAPIError, errorResponse;

  beforeEach(function() {
    errorResponse = {
      data: {
        awesome: {
          type: "not_awesome",
          message: "not awesome enough"
        }
      }
    }

    TestAPIError.properties = {
      "awesome": "$.data.awesome",
      "cheese": "$.data.cheese"
    };

    testAPIError = new TestAPIError(errorResponse);
  });

  it("should have unhandled messages", function() {
    expect(testAPIError.unhandled).toEqual(["awesome"]);
  });

  it("should return the message when handled", function() {
    expect(testAPIError.handleMessage("awesome")).toEqual("not awesome enough");
    expect(testAPIError.unhandled).toEqual([])
  });
});
