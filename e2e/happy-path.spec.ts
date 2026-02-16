import { test, expect } from '@playwright/test';

test('happy path: login, topic selection, quiz completion', async ({ page }) => {
  await page.goto('/');

  const loginButton = page.getByRole('button', { name: /login/i });
  if (await loginButton.count()) {
    await loginButton.first().click();
  }

  const startButtons = page.getByRole('button', { name: /start practice/i });
  await expect(startButtons.first()).toBeVisible();
  await startButtons.first().click();

  const questionLabel = page.getByText(/Question \d+ \/ \d+/i);

  for (let i = 0; i < 12; i += 1) {
    if (await page.getByText(/session complete/i).isVisible()) {
      break;
    }

    const currentLabel = await questionLabel.textContent();
    const answerButtons = page.locator('.ui-card button');
    await answerButtons.first().click();

    const nextButton = page.getByRole('button', { name: /next question/i });
    if (await nextButton.isVisible({ timeout: 500 })) {
      await nextButton.click();
    } else if (currentLabel) {
      await expect(questionLabel).not.toHaveText(currentLabel, { timeout: 7000 });
    }
  }

  await expect(page.getByText(/session complete/i)).toBeVisible();
  await expect(page.getByText(/precision:/i)).toBeVisible();
});
