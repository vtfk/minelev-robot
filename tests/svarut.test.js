const canSendOnSvarut = require('../lib/can-send-on-svarut')

/*
documentData.flowStatus.addParentsIfUnder18.result
documentData.flowStatus.addParentsIfUnder18
documentData.flowStatus.syncElevmappe.result.privatePerson

*/
const hasException = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 0
          }
        }
      ]
    }
  }
}

const oneParentHasException = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 0
          }
        },
        {
          privatePerson: {
            ssn: '12345678912',
            zipCode: '1234',
            addressCode: 0
          }
        }
      ]
    }
  }
}

const hasAddressBlock = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 6
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 0
          }
        }
      ]
    }
  }
}

const oneParentHasAddressBlock = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 6
          }
        },
        {
          privatePerson: {
            ssn: '12345678912',
            zipCode: '1234',
            addressCode: 0
          }
        }
      ]
    }
  }
}

const bothParentsHaveAddressBlock = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 6
          }
        },
        {
          privatePerson: {
            ssn: '12345678912',
            zipCode: '1234',
            addressCode: 7
          }
        }
      ]
    }
  }
}

const allHaveAddressBlock = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 4
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 6
          }
        },
        {
          privatePerson: {
            ssn: '12345678912',
            zipCode: '1234',
            addressCode: 7
          }
        }
      ]
    }
  }
}

const wrongZipCode = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '123',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 0
          }
        },
        {
          privatePerson: {
            ssn: '12345678912',
            zipCode: '1234',
            addressCode: 0
          }
        }
      ]
    }
  }
}

const oneParentHasWrongZipCode = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 0
          }
        },
        {
          privatePerson: {
            ssn: '12345678912',
            zipCode: '12346',
            addressCode: 0
          }
        }
      ]
    }
  }
}

const parentsAreMissing = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: []
    }
  }
}

const noParentsToAdd = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    }
  }
}

const allIsGood = {
  flowStatus: {
    freg: {
      result: {
        alder: 16
      }
    },
    syncElevmappe: {
      result: {
        privatePerson: {
          ssn: '12345678910',
          zipCode: '1234',
          addressCode: 0
        }
      }
    },
    addParentsIfUnder18: {
      result: [
        {
          privatePerson: {
            ssn: '12345678911',
            zipCode: '1234',
            addressCode: 0
          }
        },
        {
          privatePerson: {
            ssn: '12345678912',
            zipCode: '1234',
            addressCode: 0
          }
        }
      ]
    }
  }
}

describe('Check svarut exception', () => {
  test('Student has svarut exception', () => {
    expect(canSendOnSvarut(hasException, ['12345678910']).result).toBe(false)
  })
  test('One parent has exception', () => {
    expect(canSendOnSvarut(oneParentHasException, ['12345678911']).result).toBe(false)
  })
})
describe('Check address block', () => {
  test('Student has address block', () => {
    expect(canSendOnSvarut(hasAddressBlock).result).toBe(false)
  })
  test('One parent has address block', () => {
    expect(canSendOnSvarut(oneParentHasAddressBlock).result).toBe(false)
  })
  test('Both parents have address block', () => {
    expect(canSendOnSvarut(bothParentsHaveAddressBlock).result).toBe(false)
  })
  test('All have address block', () => {
    expect(canSendOnSvarut(allHaveAddressBlock).result).toBe(false)
  })
})
describe('Check zipcode', () => {
  test('Student has wrong zipcode', () => {
    expect(canSendOnSvarut(wrongZipCode).result).toBe(false)
  })
  test('One parent has wrong zipcode', () => {
    expect(canSendOnSvarut(oneParentHasWrongZipCode).result).toBe(false)
  })
})
describe('Check parents', () => {
  test('Parents are missing', () => {
    expect(canSendOnSvarut(parentsAreMissing).result).toBe(false)
  })
  test('No parents to add, can send', () => {
    expect(canSendOnSvarut(noParentsToAdd).result).toBe(true)
  })
})
describe('All is good', () => {
  test('Is all good?', () => {
    expect(canSendOnSvarut(allIsGood).result).toBe(true)
  })
})
