<template>

    <div class="journal">
        <div class="journal_image_wrapper">
            <img src="/images/2-Fig1-p-800.jpg" alt="Journal" class="journal_image">
        </div>
        <div class="journal_content">
            <p class="journal_text">{{ text }}</p>
            <NuxtLink :to="buttonUrl" class="journal_button">{{ buttonText }}</NuxtLink>
        </div>
    </div>
</template>

<script setup>
defineProps({
    text: {
        type: String,
        required: true,
    },
    buttonText: {
        type: String,
        required: true,
    },
    buttonUrl: {
        type: String,
        default: '#',
    },
});
</script>

<style lang="scss" scoped>

.journal {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    //margin: var(--40) 0;
    background-color: var(--green);
}

.journal_image_wrapper {
    width: 40%;
    height: 40vw;
}

.journal_image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.journal_content {
    width: 60%;
    padding: var(--40);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: var(--20);
}

.journal_text {
    font-size: 18px;
    color: var(--white);
}

.journal_button {
    font-size: 18px;
    font-weight: 500;
    color: var(--white);
    background-color: var(--black);
    padding: var(--10) var(--20);
    border-radius: 100px;
    text-decoration: none;
    font-style: normal;
    box-sizing: border-box;
}
</style>