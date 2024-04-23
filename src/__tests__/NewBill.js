/**
 * @jest-environment jsdom
 */

import { screen, waitFor} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH,ROUTES } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/Store.js");

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should appear", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const form = document.querySelector('form[data-testid="form-new-bill"]');
      expect(form).toBeTruthy();
    });

    test("Then email icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });

    describe("handleChangeFile", () => {
      test("Then alert should display when uploading a file with an invalid extension", () => {
        const localStorageMock = {
          getItem: jest
            .fn()
            .mockReturnValue(JSON.stringify({ email: "test@example.com" })),
        };
        document.body.innerHTML = `
          <form data-testid="form-new-bill">
            <input type="file" data-testid="file" />
          </form>
        `;
        
        const alertSpy = jest
          .spyOn(window, "alert")
          .mockImplementation(() => {});

        const newBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: null,
          localStorage: localStorageMock,
        });
       
        const fileInput = document.querySelector('input[data-testid="file"]');
        const file = new File(["dummy content"], "test.txt", {
          type: "text/plain",
        });
        Object.defineProperty(fileInput, "files", {
          value: [file],
        });
        // Trigger file change event
        fileInput.dispatchEvent(new Event("change"));
        // Expect an alert to be displayed
        expect(alertSpy).toHaveBeenCalledWith(
          "Veuillez sélectionner un fichier avec une extension jpg, jpeg ou png."
        );
        expect(fileInput.value).toBe("");
        // Restore the original implementation of window.alert
        alertSpy.mockRestore();
      });
    });
    test("Should contain all required inputs", () => {
      document.body.innerHTML = NewBillUI();

      const expenseTypeInput = document.querySelector(
        'select[data-testid="expense-type"]'
      );
      const expenseNameInput = document.querySelector(
        'input[data-testid="expense-name"]'
      );
      const dateInput = document.querySelector(
        'input[data-testid="datepicker"]'
      );
      const amountInput = document.querySelector('input[data-testid="amount"]');
      const vatInput = document.querySelector('input[data-testid="vat"]');
      const pctInput = document.querySelector('input[data-testid="pct"]');
      const commentaryInput = document.querySelector(
        'textarea[data-testid="commentary"]'
      );
      const fileInput = document.querySelector('input[data-testid="file"]');
      const submitButton = document.querySelector('button[type="submit"]');

      // Assert that all required inputs exist
      expect(expenseTypeInput).toBeTruthy();
      expect(expenseNameInput).toBeTruthy();
      expect(dateInput).toBeTruthy();
      expect(amountInput).toBeTruthy();
      expect(vatInput).toBeTruthy();
      expect(pctInput).toBeTruthy();
      expect(commentaryInput).toBeTruthy();
      expect(fileInput).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });

    test("Should submit the form with correct data", () => {
      document.body.innerHTML = NewBillUI();

      const handleSubmitSpy = jest.spyOn(NewBill.prototype, "handleSubmit");

      const newBillInstance = new NewBill({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: {
          getItem: jest.fn(() => JSON.stringify({ email: "test@example.com" })),
        },
      });

      // Simulate form submission
      const form = document.querySelector('form[data-testid="form-new-bill"]');
      form.dispatchEvent(new Event("submit"));

      // Assert that handleSubmit is called
      expect(handleSubmitSpy).toHaveBeenCalled();

      // Restore the original method after the test
      handleSubmitSpy.mockRestore();
    });
    test('Then it fails with a 404 message error', async () => {
      const errorMessage = 'Erreur 404';
      const html = BillsUI({ error: errorMessage });
      document.body.innerHTML = html;

      const message = await screen.getByText(errorMessage);
      expect(message).toBeTruthy();
    });

    test('Then it fails with a 500 message error', async () => {
      const errorMessage = 'Erreur 500';
      const html = BillsUI({ error: errorMessage });
      document.body.innerHTML = html;

      const message = await screen.getByText(errorMessage);
      expect(message).toBeTruthy();
    });    
  });
});
