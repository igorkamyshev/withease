<script setup>
import { arr, num } from '@withease/contracts';

const contract = arr(num);
</script>

<template>
    <h1>
        Out <em>Contract</em> is ensuring that passed data is an array of numbers
    </h1>
    <section>
        <h2>Valid data example</h2>
        <p>Let us pass [1, 2, 3] to the <em>Contract</em></p>
        <p>isData() 👉 {{ contract.isData([1, 2, 3]) }}</p>
        <p>getErrorMessages() 👉 {{
            JSON.stringify(contract.getErrorMessages([1, 2, 3]))
            }}</p>
    </section>

    <section>
        <h2>Invalid data example</h2>
        <p>Let us pass [1, 'WHOA', 3] to the <em>Contract</em>.
            instead
            of number.</p>
        <p>
            isData() 👉 {{ contract.isData([1, 'WHOA', 3]) }}</p>
        <p>
            getErrorMessages() 👉 {{
                JSON.stringify(contract.getErrorMessages([1, 'WHOA', 3]))
            }}</p>
    </section>
</template>
