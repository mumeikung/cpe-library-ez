const functions = require('firebase-functions')
const admin = require('firebase-admin')
const request = require('request-promise')
const _ = require('lodash')

const serviceAccount = require('./account.service.json')
const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)
adminConfig.credential = admin.credential.cert(serviceAccount)
admin.initializeApp(adminConfig)

const firestore = admin.firestore()
const auth = admin.auth()

const usersFS = firestore.collection('users')
const bookFS = firestore.collection('book')

exports.helloWorld = functions.https.onCall((data, context) => {
  console.log(data)
  if (context.auth !== null) {
    return 'login' + context.auth.uid
  } else {
    return 'not login'
  }
})

exports.searchBook = functions.https.onCall((data, context) => {
  let elasticSearchConfig = functions.config().elasticsearch
  let searchText = typeof data.search === 'string' ? data.search.trim() : ''
  let elasticSearchUrl = elasticSearchConfig.url + 'library/book/_search'
  let elasticSearchMethod = 'POST'

  let elasticSearchRequest = {
    method: elasticSearchMethod,
    uri: elasticSearchUrl,
    auth: {
      username: elasticSearchConfig.username,
      password: elasticSearchConfig.password
    },
    body: {
      min_score: 1,
      from: 0,
      size: 50,
      query: {
        multi_match: {
          query: searchText,
          fields: ["Name^5", "Publisher^2", "Author^2", "ISBN^1", "ShelfID^0.5"],
          fuzziness: 1
        }
      }
     },
    json: true
  }
  return request(elasticSearchRequest).then(response => {
    console.log('ElasticSearch', response)
    return response.hits
  }).catch(error => {
    console.error('ElasticSearch', error)
    return error
  })
})

exports.bookUpdate = functions.firestore.document('book/{bookid}').onWrite((change, context) => {
  let book_data = change.after.exists ? change.after.data() : null
  let book_id = context.params.bookid
  console.log("indexing book " + book_id + ' ' + book_data)
  let elasticSearchFields = ['Name', 'Publisher', 'Author', 'ISBN', 'ShelfID', 'CategoryID', 'Language']
  let elasticSearchConfig = functions.config().elasticsearch
  let elasticSearchUrl = elasticSearchConfig.url + 'library/book/' + book_id
  let elasticSearchMethod = book_data ? 'POST' : 'DELETE'

  let elasticSearchRequest = {
    method: elasticSearchMethod,
    uri: elasticSearchUrl,
    auth: {
      username: elasticSearchConfig.username,
      password: elasticSearchConfig.password
    },
    body: _.pick(book_data, elasticSearchFields),
    json: true
  }
  return request(elasticSearchRequest).then(response => {
    console.log('ElasticSearch Resp: ', response)
    return ''
  }).catch(error => {
    console.log(error)
    return ''
  })
})

exports.addBook = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (!doc.exists) {
        return {message:'user-not-exists'}
      }
      if (doc.data().type !== 'staff') {
        return {message:'not-staff'}
      }
      return 'allow-to-add-book'
    }).catch(error => {
      console.error
      return error
    }).then((getto) => {
      if(typeof getto.message !== 'undefined') return getto
      if (data.id === null || data.id === undefined) {
        // add new book
        if (typeof data.Name !== 'string'
        || typeof data.CategoryID !== 'string'
        || typeof data.Publisher !== 'string'
        || typeof data.Author !== 'string'
        || typeof data.ISBN !== 'string'
        || typeof data.Language !== 'string'
        || typeof data.ShelfID !== 'string') return {message:'data-not-ready'}
        else return bookFS.add({
          Name: data.Name,
          CategoryID: data.CategoryID,
          Publisher: data.Publisher,
          Author: data.Author,
          ISBN: data.ISBN,
          Language: data.Language,
          ShelfID: data.ShelfID
        })
      }
      else {
        // exists book
        return bookFS.doc(data.id).get()
      }
    }).catch(error => {
      console.error(error)
      return error
    }).then((doc) => {
      if(typeof doc.message !== 'undefined') return doc
      if (typeof doc.exists === 'undefined') {
        // add new book
        return {bookID: doc.id}
      }
      else if (doc.exists) {
        // get book
        return {bookID: doc.id}
      }
      else return {message:'book-id-not-found'}
    }).then((getto) => {
      if(typeof getto.message !== 'undefined') return getto
      let returnPromise = []
      if (getto.bookID !== undefined) {
        // add to stock
        const amount = parseInt(data.Amount)
        if (!amount) return {message: 'amount-error'}
        for(let i= 0; i < amount; i++){
          returnPromise.push(firestore.collection('stock').add({
            ItemID: getto.bookID,
            RegisteredTime: new Date(),
            BorrowLevel: data.BorrowLevel
          }))
        }
        return Promise.all(returnPromise)
      }
      else {
        return {message:'out-of-condition'}
      }
    }).catch(error => {
      console.error(error)
      return error
    }).then((prom) => {
      if(typeof prom.message !== 'undefined') return prom
      let returnToUser = []
      prom.forEach((doc) => {
        if (doc.id !== undefined) returnToUser.push('success')
        else returnToUser.push('failed')
      })
      return returnToUser
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {message: 'auth-error'}
})

exports.addMember = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          // perm ok
          if (typeof data.email !== 'string'
          || typeof data.password !== 'string'
          || typeof data.prefix !== 'string'
          || typeof data.name !== 'string'
          || typeof data.surname !== 'string'
          || typeof data.dob !== 'string'
          || typeof data.gender !== 'string'
          || typeof data.phone !== 'string'
          || typeof data.numCanBorrow !== 'string'
          || typeof data.borrowLevel !== 'string') return {message:'data-not-ready'}
          else {
            let phone = data.phone.replace('+66', '0').replace('-', '')
            phone = '+66' + phone.slice(1, 10)
            return auth.createUser({
              email: data.email,
              emailVerified: true,
              phoneNumber: phone,
              password: data.password.trim(),
              displayName: data.name.trim() + ' ' + data.surname.trim(),
              disabled: false
            })
          }
        }
      }
      return {message:'permission-deny'}
    }).catch((error) => {
      console.error(error)
      return error
    }).then((userRecord) => {
      if(typeof userRecord.message !== 'undefined') return userRecord
      if (userRecord.uid === undefined) return {message:'uid-undefined'}
      return usersFS.doc(userRecord.uid).set({
        type: 'member',
        Prefix: data.prefix.trim(),
        Name: data.name.trim(),
        Surname: data.surname.trim(),
        DOB: data.dob,
        Gender: data.gender,
        Phone: data.phone.replace('+66', '0').replace('-', ''),
        NumCanBorrow: Number.parseInt(data.numCanBorrow),
        BorrowLevel: Number.parseInt(data.borrowLevel),
        RegisteredTime: new Date()
      })
    }).catch(error => {
      console.error(error)
      return error
    }).then((getto) => {
      if(typeof getto.message !== 'undefined') return getto
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.getBorrowBookInfo = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    let temp = {}
    return firestore.collection('users').doc(context.auth.uid).get().then((doc) => {
      if (!doc.exists) return {message: 'user-not-exists'}
      if (doc.data().type !== 'staff') return {message: 'not-staff'}
      return 'allow-to-get-book-info'
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(typeof data.StockID !== 'string'
      || typeof data.uid !== 'string') return {message: 'data-not-ready'}
      else return firestore.collection('users').doc(data.uid).get()
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(doc.exists){
        temp.user = doc.data()
        temp.user.uid = doc.id
        return firestore.collection('stock').doc(data.StockID).get()
      }
      else return {message: 'user-not-exist'}
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(doc.exists){
      if(doc.data().BorrowLevel <= temp.user.BorrowLevel){
          temp.stock = doc.data()
          temp.stock.id = doc.id
          return firestore.collection('book').doc(temp.stock.ItemID).get()
        }
        else return {message: 'not-allow-to-borrow-this-book'}
      }
      else return {message: 'book-not-exist'}
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      temp.book = doc.data()
      return firestore.collection('borrow').where('StockID', '==', temp.stock.id).where('ReturnTime', '==', 'not yet').get()
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if (doc.size >= 1) return {message: 'book-already-borrow'}
      return firestore.collection('borrow').where('Borrower', '==', temp.user.uid).where('ReturnTime', '==', 'not yet').get()
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(doc.size + data.CurrentNumGonnaBorrow < temp.user.NumCanBorrow){
        let requestedInfo = {
          user: {},
          book: {},
          stock: {}
        }
        requestedInfo.user.Name = temp.user.Name
        requestedInfo.user.type = temp.user.type
        requestedInfo.user.NumCanBorrow = temp.user.NumCanBorrow
        requestedInfo.stock.BorrowLevel = temp.stock.BorrowLevel
        requestedInfo.stock.id = temp.stock.id
        requestedInfo.book.Name = temp.book.Name
        requestedInfo.book.CategoryID = temp.book.CategoryID
        requestedInfo.book.Publisher = temp.book.Publisher
        requestedInfo.book.Author = temp.book.Author
        requestedInfo.book.Language = temp.book.Language
        request.NumOfBorrowingBook = doc.size + data.CurrentNumGonnaBorrow
        return requestedInfo
      }
      else return {message: 'exceed-amount-of-book-are-allowed'}
    }).catch(err => {
      console.error(err)
      return err
    })
  }
  else return {message: 'auth-error'}
})

exports.borrowBook = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    let userData = {}
    return firestore.collection('users').doc(context.auth.uid).get().then((doc) => {
      if (!doc.exists) return {message: 'user-not-exists'}
      if (doc.data().type !== 'staff') return {message: 'not-staff'}
      return 'allow-to-do-borrow-stuffs'
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(typeof data.uid !== 'string') return {message: 'data-not-ready'}
      else return firestore.collection('users').doc(data.uid).get()
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(doc.exists) {
        userData = doc.data()
        userData.uid = doc.id
        return firestore.collection('borrow').where('Borrower', '==', data.uid).where('ReturnTime', '==', 'not yet').get()
      }
      else return {message: 'user-not-exist'}
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      let returnPromise = []
      if(Array.isArray(data.stock)){
        if(data.stock.length + doc.size <= userData.NumCanBorrow){
          data.stock.forEach((getData) => {
            if(typeof getData !== 'string') throw new Error('data-not-ready')
            else returnPromise.push(firestore.collection('stock').doc(getData).get())
          })
          return Promise.all(returnPromise)
        }
        else return {message: 'exceed-amount-of-book-are-allowed'}
      }
      else return {message: 'stock-not-array'}
    }).catch(err => {
      console.error(err)
      return err
    }).then((promiseDoc) => {
      if(promiseDoc.message !== undefined) return promiseDoc
      let returnPromise = []
      promiseDoc.forEach((doc) => {
        if(doc.exists){
          if(doc.data().BorrowLevel <= userData.BorrowLevel){
            let currentDate = new Date()
            let dueDate = new Date()
            dueDate.setDate(currentDate.getDate() + 7)
            returnPromise.push(firestore.collection('borrow').add({
              StockID: doc.id,
              BorrowTime: currentDate,
              DueTime: dueDate,
              Borrower: userData.uid,
              StaffID: context.auth.uid,
              ReturnTime: 'not yet',
              Fine: 0
            }))
          }
          else throw new Error('not-allow-to-borrow-this-book')
        }
        else throw new Error('stock-not-exist')
      })
      return Promise.all(returnPromise)
    }).catch(err => {
      console.error(err)
      return err
    }).then((prom) => {
      if(prom.message !== undefined) return prom
      let output = []
      prom.forEach((doc) => {
        output.push(doc.id !== undefined ? 'success' : 'failed')
      })
      return output
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {message: 'auth-error'}
})

exports.returnBook = functions.https.onCall((data, context) => {
  if(context.auth.uid !== null) {
    let Fine = 0
    return firestore.collection('users').doc(context.auth.uid).get().then((doc) => {
      if (!doc.exists) return {message: 'user-not-exists'}
      if (doc.data().type !== 'staff' && doc.data().Status) return {message: 'not-staff'}
      return 'allow-to-do-return-stuffs'
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(typeof data.StockID !== 'string') return {message: 'data-not-ready'}
      else return firestore.collection('borrow').where('StockID', '==', data.StockID).where('ReturnTime', '==', 'not yet').get()
    }).then((doc) => {
      if(doc.message !== undefined) return doc
      if(doc.size > 0){
        let today = new Date()
        let dueTime = doc.docs[0].data().DueTime
        today.setHours(0,0,0,0)
        dueTime.setHours(0,0,0,0)
        if(dueTime < today) Fine = (today.getTime() - dueTime.getTime()) / (24*60*60*1000) * 15
        return doc.docs[0].ref.update({
          ReturnTime: today,
          Fine: Fine
        })
      }
      else return {message: 'stock-not-found'}
    }).catch(err => {
      console.error(err)
      return err
    }).then((doc) => {
      if (doc.message !== undefined) return doc
      return {
        status: 'success',
        fine: Fine
      }
    }).catch(err => {
      console.error(err)
      return err
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.editMember = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    let readyToUse = null
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          // perm ok
          if (typeof data.uid !== 'string'
          || typeof data.prefix !== 'string'
          || typeof data.name !== 'string'
          || typeof data.surname !== 'string'
          || typeof data.dob !== 'string'
          || typeof data.gender !== 'string'
          || typeof data.phone !== 'string'
          || typeof data.numCanBorrow !== 'string'
          || typeof data.borrowLevel !== 'string') return {message:'data-not-ready'}
          else {
            let phone = data.phone.replace('+66', '0').replace('-', '')
            phone = '+66' + phone.slice(1, 10)
            readyToUse = {
              phoneNumber: phone,
              displayName: data.name.trim() + ' ' + data.surname.trim()
            }
            return usersFS.doc(data.uid).update({
              Prefix: data.prefix.trim(),
              Name: data.name.trim(),
              Surname: data.surname.trim(),
              DOB: data.dob,
              Gender: data.gender,
              Phone: data.phone.replace('+66', '0').replace('-', ''),
              NumCanBorrow: Number.parseInt(data.numCanBorrow),
              BorrowLevel: Number.parseInt(data.borrowLevel)
            })
          }
        }
        else if (doc.data().type === 'member' && doc.id === data.uid) {
          // user edit
          if (typeof data.uid !== 'string'
          || typeof data.prefix !== 'string'
          || typeof data.name !== 'string'
          || typeof data.surname !== 'string'
          || typeof data.phone !== 'string') return {message:'data-not-ready'}
          else {
            let phone = data.phone.replace('+66', '0').replace('-', '')
            phone = '+66' + phone.slice(1, 10)
            readyToUse = {
              phoneNumber: phone,
              displayName: data.name.trim() + ' ' + data.surname.trim()
            }
            return doc.ref.update({
              Prefix: data.prefix.trim(),
              Name: data.name.trim(),
              Surname: data.surname.trim(),
              Phone: data.phone.replace('+66', '0').replace('-', '')
            })
          }
        }
      }
      return {message:'permission-deny'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((getto) => {
      if (typeof getto.message !== 'undefined') return getto
      if (readyToUse === null) return {message:'data-to-update-not-found'}
      return auth.updateUser(data.uid, readyToUse)
    }).catch(error => {
      console.error(error)
      return error
    }).then((getto) => {
      if (typeof getto.message !== 'undefined') return getto
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.addStaff = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          // perm ok
          if (typeof data.email !== 'string'
          || typeof data.password !== 'string'
          || typeof data.prefix !== 'string'
          || typeof data.name !== 'string'
          || typeof data.surname !== 'string'
          || typeof data.dob !== 'string'
          || typeof data.gender !== 'string') return {message:'data-not-ready'}
          else {
            return auth.createUser({
              email: data.email,
              emailVerified: true,
              password: data.password.trim(),
              displayName: data.name.trim() + ' ' + data.surname.trim(),
              disabled: false
            })
          }
        }
      }
      return {message:'permission-deny'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((userRecord) => {
      if (userRecord.uid === undefined) return {message:'uid-undefined'}
      return usersFS.doc(userRecord.uid).set({
        type: 'staff',
        Prefix: data.prefix.trim(),
        Name: data.name.trim(),
        Surname: data.surname.trim(),
        DOB: data.dob,
        Gender: data.gender,
        Status: typeof data.status === 'boolean' ? data.status : true,
        RegisteredTime: new Date()
      })
    }).catch(error => {
      console.error(error)
      return error
    }).then((getto) => {
      if (typeof getto.message !== 'undefined') return getto
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.categorySet = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          if (typeof data.id !== 'string' || typeof data.description !== 'string') return {message:'data-not-ready'}
          else {
            let id = Number.parseInt(data.id)
            if (id < 1 || id > 999) return {message:'id-error'}
            return firestore.collection('category').doc(data.id).set({
              id: id,
              description: data.description.trim()
            })
          }
        }
      }
      return {message:'permission-deny'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((getto) => {
      if (typeof getto.message !== 'undefined') return getto
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.editBook = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          if (typeof data.bookID !== 'string'
          || typeof data.Name !== 'string'
          || typeof data.CategoryID !== 'string'
          || typeof data.Publisher !== 'string'
          || typeof data.Author !== 'string'
          || typeof data.ISBN !== 'string'
          || typeof data.Language !== 'string'
          || typeof data.ShelfID !== 'string') return {message:'data-not-ready'}
          else {
            return bookFS.doc(data.bookID).update({
              Name: data.Name.trim(),
              CategoryID: data.CategoryID.trim(),
              Publisher: data.Publisher.trim(),
              Author: data.Author.trim(),
              ISBN: data.ISBN.trim(),
              Language: data.Language.trim(),
              ShelfID: data.ShelfID.trim()
            })
          }
        }
      }
      return {message:'permission-deny'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((getto) => {
      if (typeof getto.message !== 'undefined') return getto
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.editStockLevel = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          let BorrowLevel = parseInt(data.BorrowLevel)
          if (typeof data.stockID !== 'string' || BorrowLevel) return {message:'data-not-ready'}
          else if (BorrowLevel <= 0 || BorrowLevel > 127) return {message:'Borrow-Level-out-of-range'}
          else {
            return firestore.collection('stock').doc(data.stockID).update({
              BorrowLevel: BorrowLevel
            })
          }
        }
      }
      return {message:'permission-deny'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((getto) => {
      if (typeof getto.message !== 'undefined') return getto
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.getMemberData = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          if (typeof data.uid !== 'string') return {message: 'uid-not-ready'}
          return usersFS.doc(data.uid.trim()).get()
        }
      }
      return {message: 'permission-deny'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((doc) => {
      if (typeof doc.message !== 'undefined') return doc
      if (doc.exists) {
        if (doc.data().type !== 'member') return {message: 'not-member'}
        let userData = doc.data()
        userData.uid = doc.id
        return userData
      } else {
        return {message:'user-not-found'}
      }
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.checkIn = functions.https.onCall((data, context) => {
  if(context.auth !== null){
    if (typeof data.uid !== 'string') return {message: 'uid-not-read'}
    return usersFS.doc(data.uid).get().then((doc) => {
      if(doc.exists) return firestore.collection('checkinout').where('uid', '==', data.uid).where('TimeOut', '==', null).get()
      else return {message:'user-not-exist'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((doc) => {
      if(typeof doc.message !== 'undefined') return doc
      if(doc.size === 0){
        return firestore.collection('checkinout').add({
          TimeIn: new Date(),
          TimeOut: null,
          uid: data.uid
        })
      }
      else return {message: 'you-already-check-in'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((doc) => {
      if(typeof doc.message !== 'undefined') return doc
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.checkOut = functions.https.onCall((data, context) => {
  if(context.auth !== null){
    if (typeof data.uid !== 'string') return {message: 'uid-not-read'}
    return usersFS.doc(data.uid).get().then((doc) => {
      if(doc.exists) return firestore.collection('checkinout').where('uid', '==', data.uid).where('TimeOut', '==', null).get()
      else return {message:'user-not-exist'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((doc) => {
      if(typeof doc.message !== 'undefined') return doc
      if(doc.size > 0){
        return doc.docs[0].ref.update({
          TimeOut: new Date()
        })
      }
      return {message:'not-check-in-yet'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((doc) => {
      if(typeof doc.message !== 'undefined') return doc
      return 'success'
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})

exports.analysis1057_1 = functions.https.onCall((data, context) => {
  return firestore.collection('borrow').get().then((docs) => {
    let count = {}
    let result = []
    docs.forEach((doc) => {
      if(count[doc.data().BorrowTime.getFullYear().toString()] === undefined) count[doc.data().BorrowTime.getFullYear().toString()] = {}
      count[doc.data().BorrowTime.getFullYear().toString()][doc.data().BorrowTime.getMonth().toString()] = 0
    })
    docs.forEach((doc) => {
      count[doc.data().BorrowTime.getFullYear().toString()][doc.data().BorrowTime.getMonth().toString()] += 1
    })
    for(let y in count){
      let temp = count[y]
      for(let m in temp){
        result.push({year: y, month: m, count: count[y][m]})
      }
    }
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result
  })
})

exports.analysis1057_2 =  functions.https.onCall((data, context) => {
  let temp = {}
  let count = {}
  return firestore.collection('borrow').get().then((docs) => {
    docs.forEach((doc => {
      temp[doc.data().StockID] = 0
    }))
    docs.forEach((doc => {
      temp[doc.data().StockID] += 1
    }))
    return firestore.collection('stock').get()
  }).then((docs) => {
    docs.forEach(doc => {
      count[doc.data().ItemID] = 0
    })
    docs.forEach(doc => {
      count[doc.data().ItemID] += 1
    })
    return firestore.collection('book').get()
  }).then((docs) => {
    let result = []
    docs.forEach(doc => {
      result.push({itemID: doc.id, bookName: doc.data().Name, categoryID: doc.data().CategoryID, count: count[doc.id]})
    })
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1057_3 = functions.https.onCall((data, context) => {
    let temp = {}
    let count = {}
    return firestore.collection('borrow').get().then((docs) => {
      docs.forEach(doc => {
        if(doc.data().ReturnTime !== 'not yet'){
          doc.data().ReturnTime.setHours(0,0,0,0)
          doc.data().BorrowTime.setHours(0,0,0,0)
          temp[doc.data().StockID] = 0
        }
      })
      docs.forEach(doc => {
        if(doc.data().ReturnTime !== 'not yet') temp[doc.data().StockID] += (doc.data().ReturnTime - doc.data().BorrowTime)/(24*60*60*1000)
      })
      return firestore.collection('stock').get()
    }).then((docs) => {
      docs.forEach(doc => {
        count[doc.data().ItemID] = 0
      })
      docs.forEach(doc => {
        count[doc.data().ItemID] += temp[doc.id]
      })
      return firestore.collection('book').get()
    }).then((docs) => {
      let result = []
      docs.forEach(doc => {
        if(count[doc.id]) result.push({itemID: doc.id, bookName: doc.data().Name, categoryID: doc.data().CategoryID, count: count[doc.id]})
      })
      result = _.orderBy(result, 'count', 'desc')
      let i = 1
      result.forEach(doc => {
        doc.rank = i
        i++
      })
      return result.slice(0,9)
    })
})

exports.analysis1070_1_in = functions.https.onCall((data, context) => {
  return firestore.collection('checkinout').get().then((docs) => {
    let count = {}
    let result = []
    docs.forEach(doc => {
      count[doc.data().TimeIn.getHours().toString()] = 0
    })
    docs.forEach(doc => {
      count[doc.data().TimeIn.getHours().toString()] += 1
    })
    for(let h in count){
      result.push({hourIn: h, count: count[h]})
    }
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1070_1_out = functions.https.onCall((data, context) => {
  return firestore.collection('checkinout').get().then((docs) => {
    let count = {}
    let result = []
    docs.forEach(doc => {
      count[doc.data().TimeOut.getHours().toString()] = 0
    })
    docs.forEach(doc => {
      count[doc.data().TimeOut.getHours().toString()] += 1
    })
    for(let h in count){
      result.push({hourOut: h, count: count[h]})
    }
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1070_2 = functions.https.onCall((data, context) => {
  return firestore.collection('checkinout').get().then((docs) => {
    let count = {}
    let result = []
    docs.forEach(doc => {
      if(count[doc.data().TimeIn.getFullYear().toString()] === undefined) count[doc.data().TimeIn.getFullYear().toString()] = {}
      if(count[doc.data().TimeIn.getFullYear().toString()][doc.data().TimeIn.getMonth().toString()] === undefined) count[doc.data().TimeIn.getFullYear().toString()][doc.data().TimeIn.getMonth().toString()] = {}
      count[doc.data().TimeIn.getFullYear().toString()][doc.data().TimeIn.getMonth().toString()][doc.data().TimeIn.getDate().toString()] = 0
    })
    docs.forEach(doc => {
      count[doc.data().TimeIn.getFullYear().toString()][doc.data().TimeIn.getMonth().toString()][doc.data().TimeIn.getDate().toString()] += 1
    })
    for(let y in count){
      let tempYear = count[y]
      for(let m in tempYear){
        let tempMonth = tempYear[m]
        for(let d in tempMonth){
          result.push({year: y, month: m, day: d, count: count[y][m][d]})
        }
      }
    }
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1070_3 = functions.https.onCall((data, context) => {
  return firestore.collection('checkinout').get().then((docs) => {
    let min = {}
    let result = []
    docs.forEach(doc => {
      min[doc.data().uid] = 0
    })
    docs.forEach(doc => {
      min[doc.data().uid] += (doc.data().TimeOut.getTime() - doc.data().TimeIn.getTime())/60000 //to min
    })
    for(let id in min){
      result.push({uid: id, min: min[id]})
    }
    result = _.orderBy(result, 'min', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1085_1 = functions.https.onCall((data, context) => {
  return firestore.collection('borrow').get().then((docs) => {
    let sum = {}
    let result = []
    docs.forEach(doc => {
      if(doc.data().ReturnTime !== 'not yet'){
        if(sum[doc.data().ReturnTime.getFullYear().toString()] === undefined) sum[doc.data().ReturnTime.getFullYear().toString()] = {}
        sum[doc.data().ReturnTime.getFullYear().toString()][doc.data().ReturnTime.getMonth().toString()] = 0
      }
    })
    docs.forEach(doc => {
      if(doc.data().ReturnTime !== 'not yet') sum[doc.data().ReturnTime.getFullYear().toString()][doc.data().ReturnTime.getMonth().toString()] += doc.data().Fine
    })
    for(let y in sum){
      let temp = sum[y]
      for(let m in temp){
        result.push({year: y, month: m, sumFine: sum[y][m]})
      }
    }
    result = _.orderBy(result, 'sumFine', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result
  })
})

exports.analysis1085_2 = functions.https.onCall((data, context) => {
  return firestore.collection('users').get().then((docs) => {
    let count = {}
    let today = new Date()
    let result = []
    let a = null
    let b = null
    docs.forEach(doc => {
      b = new Date(doc.data().DOB)
      a = today.getFullYear() - b.getFullYear()
      if(count[a.toString()] === undefined) count[a.toString()] = {}
      count[a.toString()][doc.data().Gender] = 0
    })
    docs.forEach(doc => {
      b = new Date(doc.data().DOB)
      a = today.getFullYear() - b.getFullYear()
      count[a.toString()][doc.data().Gender] += 1
    })
    for(let y in count){
      let temp = count[y]
      for(let g in temp){
        result.push({age: y, gender: g, count: count[y][g]})
      }
    }
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1085_3 = functions.https.onCall((data, context) => {
  return firestore.collection('stock').get().then((docs) => {
    let count = {}
    let result = []
    docs.forEach(doc => {
      count[doc.data().RegisteredTime.getMonth().toString()] = 0
    })
    docs.forEach(doc => {
      count[doc.data().RegisteredTime.getMonth().toString()] += 1
    })
    for(let m in count){
      result.push({month: m, count: count[m]})
    }
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1093_1 = functions.https.onCall((data, context) => {
  return firestore.collection('book').get().then((docs) => {
    let count = {}
    let result = []
    docs.forEach(doc => {
      count[doc.data().Publisher] = 0
    })
    docs.forEach(doc => {
      count[doc.data().Publisher] += 1
    })
    for(let p in count){
      result.push({Publisher: p, count: count[p]})
    }
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1093_2 = functions.https.onCall((data, context) => {
  let count = {}
  return firestore.collection('book').get().then((docs) => {
    docs.forEach(doc => {
      count[doc.data().CategoryID] = 0
    })
    docs.forEach(doc => {
      count[doc.data().CategoryID] += 1
    })
    return firestore.collection('category').get()
  }).then((docs) => {
    let result = []
    docs.forEach(doc => {
      if(count[doc.id] !== undefined) result.push({CategoryID: doc.id, Description: doc.data().description, count: count[doc.id]})
    })
    result = _.orderBy(result, 'count', 'desc')
    let i = 1
    result.forEach(doc => {
      doc.rank = i
      i++
    })
    return result.slice(0,9)
  })
})

exports.analysis1093_3 = functions.https.onCall((data, context) => {
  let count = {}
  return firestore.collection('stock').get().then((docs) => {
    docs.forEach(doc => {
      count[doc.data().ItemID] = 0
    })
    docs.forEach(doc => {
      count[doc.data().ItemID] += 1
    })
    return firestore.collection('book').get()
  }).then((docs) => {
    let result = []
      docs.forEach(doc => {
        result.push({itemID: doc.id, bookName: doc.data().Name, publisher: doc.data().Publisher, author: doc.data().Author, count: count[doc.id]})
      })
      result = _.orderBy(result, 'count', 'desc')
      let i = 1
      result.forEach(doc => {
        doc.rank = i
        i++
      })
      return result.slice(0,9)
  })
})

exports.getMemberDatabyEmail = functions.https.onCall((data, context) => {
  if (context.auth !== null) {
    return usersFS.doc(context.auth.uid).get().then((doc) => {
      if (doc.exists) {
        if (doc.data().type === 'staff' && doc.data().Status) {
          if (typeof data.email !== 'string') return {message: 'uid-not-ready'}
          return auth.getUserByEmail(data.email.trim())
        }
      }
      return {message: 'permission-deny'}
    }).catch(error => {
      console.error(error)
      return error
    }).then((userRecord) => {
      if (typeof userRecord.message !== 'undefined') return userRecord
      return usersFS.doc(userRecord.uid).get()
    }).catch(error => {
      console.error(error)
      return error
    }).then((doc) => {
      if (typeof doc.message !== 'undefined') return doc
      if (doc.exists) {
        if (doc.data().type !== 'member') return {message: 'not-member'}
        let userData = doc.data()
        userData.uid = doc.id
        return userData
      } else {
        return {message:'user-not-found'}
      }
    }).catch(error => {
      console.error(error)
      return error
    })
  }
  else return {
    message: 'auth-error'
  }
})
