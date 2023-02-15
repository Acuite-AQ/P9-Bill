/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // expect(windowIcon).toHaveClass('active-icon')
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({
        data: bills
      })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('When I click on the new bill button', () => {
    test("then newBill page appears", () => {
      // simulate localStorage
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const billsPage = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })

      // Test handleClick...
      const openNewBill = jest.fn(billsPage.handleClickNewBill)
      // Test click button
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      // listen click
      buttonNewBill.addEventListener('click', openNewBill)
      // simulate click
      fireEvent.click(buttonNewBill)
      expect(openNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })

      describe("When I click on the eye icon", () => {
        test("then modal should open", () => {
          const html = BillsUI({
            data: bills
          })
          document.body.innerHTML = html
          // navigation to bill page
          const onNavigate = (pathName) => {
            document.body.innerHTML = ROUTES({
              pathName
            })
          }
          // create new instance of Bills
          const billsContainer = new Bills({
            document,
            onNavigate,
            localStorage: localStorageMock,
            storage: null,
          })

          // simulate modal opening and click
          $.fn.modal = jest.fn()
          const handleClickIconEye = jest.fn(() => {
          billsContainer.handleClickIconEye
        })
        const firstEyeIcon = screen.getAllByTestId('icon-eye')[0]
        firstEyeIcon.addEventListener("click", handleClickIconEye)
        fireEvent.click(firstEyeIcon)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
    })
})

// test d'intégration GET
describe("When I navigate to Bills Page", () => {
  test("Then bills should appear", async () => {
    const bills = new Bills({
      document,
      onNavigate,
      localStorage: window.localStorage
    });
    const getBills = jest.fn(() => bills.getBills())
    const value = await getBills()
    expect(getBills).toHaveBeenCalled()
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
  test('fetches error from an API and fails with 404 error', async () => {
    jest.spyOn(mockStore, 'bills')
    jest.spyOn(console, 'error').mockImplementation(() => {})
    Object.defineProperty(Window, 'localStorage', {
        value: localStorageMock
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
            update: () => Promise.reject(new Error('Erreur 404')),
            list: () => Promise.reject(new Error('Erreur 404'))
        }
    })
  })
})