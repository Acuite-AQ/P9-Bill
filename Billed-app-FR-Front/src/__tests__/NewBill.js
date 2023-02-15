/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import mockStore from '../__mocks__/store.js'
import localStorageMock from '../__mocks__/localStorage.js'
jest.mock("../app/store", () => mockStore)
import router from "../app/router.js"




describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page, and try to download a file with extension different from jpeg, jpg or png", () => {
        test("Then an error message appear, you cannot download", () => {
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const html = NewBillUI()
            document.body.innerHTML = html
            //to-do write assertion
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({
                    pathname
                })
            }
            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window,
                localStorage,
            })
            const LoadFile = jest.fn((e) => newBill.handleChangeFile(e))
            const fichier = screen.getByTestId("file")
            //  invalid format
            const file = new File(["c'est un test"], "document.txt", {
                type: "document/txt"
            })
            fichier.addEventListener("change", LoadFile)
            fireEvent.change(fichier, {
                target: {
                    files: [file]
                }
            })
            expect(LoadFile).toHaveBeenCalled()

            expect(screen.getByText("Choisissez un format image (jpeg, png, jpg)")).toBeTruthy()
        })
    })

    describe("When i download the attached file in the correct format", () => {
        test("the new bill is sent", () => {
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const html = NewBillUI()
            document.body.innerHTML = html
            //to-do write assertion
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({
                    pathname
                })
            }
            const newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window,
                localStorage,
            })
            const LoadFile = jest.fn((e) => newBill.handleChangeFile(e))
            const fichier = screen.getByTestId("file")
            // valid format
            const file = new File(["c'est un test"], "image.jpg", {
                type: "image/jpg"
            })
            fichier.addEventListener("change", LoadFile)
            fireEvent.change(fichier, {
                target: {
                    files: [file]
                }
            })
            // file is downloaded
            expect(LoadFile).toHaveBeenCalled()
            // downloaded file is correct
            expect(fichier.files[0]).toStrictEqual(file)

            const formNewBill = screen.getByTestId('form-new-bill')
            // simulate handleSubmit
            const sendNewBill = jest.fn((e) => newBill.handleSubmit(e))
            // listen to submit event
            formNewBill.addEventListener('submit', sendNewBill)
            //  simulate event
            fireEvent.submit(formNewBill)
            expect(sendNewBill).toHaveBeenCalled()
            expect(screen.getByText('Mes notes de frais')).toBeTruthy()
        })
    })

    describe("When an error occurs on API", () => {
        beforeEach(() => {
            jest.spyOn(mockStore, "bills")
            Object.defineProperty(
                window,
                'localStorage', {
                    value: localStorageMock
                }
            )
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
        })
        test('fetches error from an API and fails with 500 error', async () => {
            jest.spyOn(mockStore, 'bills')
            jest.spyOn(console, 'error').mockImplementation(() => {})
            Object.defineProperty(Window, 'localStorage', {
                value: localStorageMock
            })
            Object.defineProperty(Window, 'location', {
                value: {
                    hash: ROUTES_PATH['NewBill']
                }
            })
            document.body.innerHTML = `<div id="root"></div>`
            router()
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({
                    pathname
                })
            }
            mockStore.bills = jest.fn().mockImplementation(() => {
                return {
                    update: () => Promise.reject(new Error('Erreur 500')),
                    list: () => Promise.reject(new Error('Erreur 500'))
                }
            })
        })
    })
})